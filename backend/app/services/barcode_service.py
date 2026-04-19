import httpx

OPEN_FOOD_FACTS = "https://world.openfoodfacts.net/api/v2/product"


async def lookup_barcode(barcode: str) -> dict | None:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{OPEN_FOOD_FACTS}/{barcode}")
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != 1:
            return None
        product = data["product"]
        return {
            "name": product.get("product_name", ""),
            "brand": product.get("brands", ""),
            "ingredients_text": product.get("ingredients_text", ""),
            "ingredients_list": [
                i.get("id", "").replace("en:", "").replace("-", " ").strip()
                for i in product.get("ingredients", [])
                if i.get("id")
            ],
            "category": product.get("categories", ""),
            "image_url": product.get("image_url", ""),
            "nutriscore": product.get("nutriscore_grade", ""),
            "ecoscore": product.get("ecoscore_grade", ""),
        }
