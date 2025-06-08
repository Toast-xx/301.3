import json
from app1 import app, db, Shoes  # Replace with your actual file/module name

def import_shoes_from_json(json_file_path):
    with app.app_context():
        with open(json_file_path) as f:
            shoes_data = json.load(f)
        
        for shoe in shoes_data:
            new_shoe = Shoes(
                title=shoe['title'],
                price=shoe['price'],
                category=shoe['category'],
                sizes=','.join(shoe['sizes']),  # assuming sizes is a list in your JSON
                model=shoe['model'],
                style=shoe['style'],
                brand=shoe['brand'],
                main_image=shoe['main_image'],
                gallery=','.join(shoe['gallery'])  # all gallery URLs joined with commas
            )
            db.session.add(new_shoe)
        
        db.session.commit()
        print(f"Imported {len(shoes_data)} shoes successfully.")

if __name__ == "__main__":
    import_shoes_from_json('static/data/products.json')
