import httpx
import asyncio

PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
PUBCHEM_VIEW = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view"


async def get_chemical_safety(ingredient_name: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Resolve name to CID
            resp = await client.get(
                f"{PUBCHEM_BASE}/compound/name/{ingredient_name}/cids/JSON"
            )
            if resp.status_code != 200:
                return {"found": False, "name": ingredient_name}

            cid_data = resp.json()
            if "IdentifierList" not in cid_data:
                return {"found": False, "name": ingredient_name}

            cid = cid_data["IdentifierList"]["CID"][0]

            # Fetch safety and toxicology data in parallel
            safety_resp, tox_resp, props_resp = await asyncio.gather(
                client.get(f"{PUBCHEM_VIEW}/data/compound/{cid}/JSON", params={"heading": "Safety+and+Hazards"}),
                client.get(f"{PUBCHEM_VIEW}/data/compound/{cid}/JSON", params={"heading": "Toxicity"}),
                client.get(f"{PUBCHEM_BASE}/compound/cid/{cid}/property/IUPACName,MolecularWeight,IsomericSMILES/JSON"),
            )

            props = {}
            if props_resp.status_code == 200:
                p = props_resp.json().get("PropertyTable", {}).get("Properties", [{}])[0]
                props = {
                    "iupac_name": p.get("IUPACName"),
                    "molecular_weight": p.get("MolecularWeight"),
                }

            return {
                "found": True,
                "cid": cid,
                "name": ingredient_name,
                "properties": props,
                "safety_raw": safety_resp.json() if safety_resp.status_code == 200 else {},
                "toxicology_raw": tox_resp.json() if tox_resp.status_code == 200 else {},
            }

        except Exception as e:
            return {"found": False, "name": ingredient_name, "error": str(e)}


async def get_bulk_chemical_safety(ingredients: list[str]) -> list[dict]:
    # Rate-limit: max 5 concurrent requests to PubChem (free tier)
    semaphore = asyncio.Semaphore(5)

    async def limited_fetch(name: str) -> dict:
        async with semaphore:
            return await get_chemical_safety(name)

    return list(await asyncio.gather(*[limited_fetch(ing) for ing in ingredients]))
