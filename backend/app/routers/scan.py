import asyncio
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services import ocr_service, barcode_service, pubchem_service, claude_service, pill_identifier
from app.models.scan import Scan

router = APIRouter(prefix="/scan", tags=["scan"])


@router.post("/label")
async def scan_label(
    image: UploadFile = File(...),
    language: str = Form(default="en"),
    user_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Scan a product label photo — OCR extracts ingredients, Claude analyzes safety."""
    image_bytes = await image.read()

    extracted = await ocr_service.extract_ingredients_from_image(image_bytes)
    ingredients = extracted.get("ingredients", [])

    if not ingredients:
        return {"error": "No ingredients found on label", "raw": extracted}

    pubchem_data = await pubchem_service.get_bulk_chemical_safety(ingredients)
    report = await claude_service.generate_toxicology_report(ingredients, pubchem_data, language)

    # Save scan to DB
    scan = Scan(
        user_id=user_id,
        scan_type="label_photo",
        input_raw=str(ingredients),
        result_json=report,
        language_used=language,
    )
    db.add(scan)
    await db.flush()

    return {
        "scan_id": str(scan.id),
        "product_name": extracted.get("product_name"),
        "brand": extracted.get("brand"),
        "ingredients_found": ingredients,
        "report": report,
    }


@router.post("/barcode")
async def scan_barcode(
    barcode: str = Form(...),
    language: str = Form(default="en"),
    user_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Scan a barcode — looks up Open Food Facts, then analyzes ingredients."""
    product = await barcode_service.lookup_barcode(barcode)
    if not product:
        return {"error": "Product not found. Try scanning the label instead."}

    ingredients = product.get("ingredients_list", [])
    if not ingredients and product.get("ingredients_text"):
        # Extract from raw text
        extracted = await ocr_service.extract_ingredients_from_image(b"")
        ingredients = [product["ingredients_text"]]

    if not ingredients:
        return {"product": product, "error": "No ingredient data available for this product"}

    pubchem_data = await pubchem_service.get_bulk_chemical_safety(ingredients)
    report = await claude_service.generate_toxicology_report(ingredients, pubchem_data, language)

    scan = Scan(
        user_id=user_id,
        scan_type="barcode",
        input_raw=barcode,
        result_json={"product": product, "report": report},
        language_used=language,
    )
    db.add(scan)
    await db.flush()

    return {
        "scan_id": str(scan.id),
        "product": product,
        "report": report,
    }


@router.post("/pill")
async def scan_pill(
    image: UploadFile = File(...),
    language: str = Form(default="en"),
    user_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Identify a pill from a photo using Claude vision."""
    image_bytes = await image.read()
    identification = await pill_identifier.identify_pill(image_bytes, language)

    scan = Scan(
        user_id=user_id,
        scan_type="pill_photo",
        result_json=identification,
        language_used=language,
    )
    db.add(scan)
    await db.flush()

    return {
        "scan_id": str(scan.id),
        "identification": identification,
    }


@router.post("/text")
async def scan_text(
    query: str = Form(...),
    language: str = Form(default="en"),
    user_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Look up a drug, herb, or ingredient by name."""
    pubchem = await pubchem_service.get_chemical_safety(query)
    report = await claude_service.generate_toxicology_report([query], [pubchem], language)

    scan = Scan(
        user_id=user_id,
        scan_type="text",
        input_raw=query,
        result_json=report,
        language_used=language,
    )
    db.add(scan)
    await db.flush()

    return {
        "scan_id": str(scan.id),
        "query": query,
        "report": report,
    }
