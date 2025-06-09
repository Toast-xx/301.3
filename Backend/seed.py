from app import db
from app import Shoes
from app import app

with app.app_context():
    # Fetch the shoe you want to update
    shoe = Shoes.query.filter_by(title="Nike Air Force 1 '07").first()

    if shoe:
        shoe.variants = {
            "title": "Nike Air Force 1 '07 - White",
            "price": "$115.00",

            "white": {
                "mainImg": "C:/Users/Software Engineering/GitHub/MVP/Backend/static/images/Nike Air Force 1 '07-White_Men.webp",
                "thumbnails": [
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0021.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0022.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0023.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0024.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0025.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0026.jpg?v=1737503187&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05006169-YW240_default_0027.jpg?v=1737503187&auto=compress,format"
                ],
                "title": "Nike Air Force 1 '07 - White/Black",
                "price": "$115.00"
            },
            "black/white": {
                "mainImg": "https://culture-kings-nz.imgix.net/files/194499062899_default_0010.jpg?v=1698299819&fit=crop&h=1000&w=800&auto=compress,format",
                "thumbnails": [
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0020.jpg?v=1698299822&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0030.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0040.jpg?v=1698299821&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0050.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0060.jpg?v=1698299820&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0070.jpg?v=1698299822&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194499062899_default_0080.jpg?v=1698299821&fit=crop&h=1000&w=800&auto=compress,format"
                ],
                "title": "Nike Air Force 1 '07 - Black/White",
                "price": "$115.00"
            },
            "black": {
                "mainImg": "https://culture-kings-nz.imgix.net/files/194500874725_default_0010_add4e395-f232-484c-95d8-01ef01927772.jpg?v=1721366399&fit=crop&h=1000&w=800&auto=compress,format",
                "thumbnails": [
                    "https://culture-kings-nz.imgix.net/files/194500874725_default_0020.jpg?v=1721366398&fit=crop&h=1000&w=800&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194500874725_default_0030.jpg?v=1721366399&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194500874725_default_0040.jpg?v=1721366399&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194500874725_default_0050.jpg?v=1721366398&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/194500874725_default_0060.jpg?v=1721366398&auto=compress,format"
                ],
                "title": "Nike Air Force 1 '07 - Black",
                "price": "$115.00"
            },
            "tan/brown": {
                "mainImg": "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0010.jpg?v=1745893567&fit=crop&h=1000&w=800&auto=compress,format",
                "thumbnails": [
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0020.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0030.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0040.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0050.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0060.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0070.jpg?v=1745893567&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/05013129-YP276_default_0080.jpg?v=1745893567&auto=compress,format"
                ],
                "title": "Nike Air Force 1 '07 - Tan/Brown",
                "price": "$115.00"
            },
            "panda": {
                "mainImg": "https://culture-kings-nz.imgix.net/files/196153294493_default_0010.jpg?v=1722898025&fit=crop&h=1000&w=800&auto=compress,format",
                "thumbnails": [
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0020.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0030.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0040.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0050.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0065.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0070.jpg?v=1722898025&auto=compress,format",
                    "https://culture-kings-nz.imgix.net/files/196153294493_default_0080.jpg?v=1722898025&auto=compress,format"
                ],
                "title": "Nike Air Force 1 '07 - Panda",
                "price": "$115.00"
            }
        }
        db.session.commit()
        print("Variants added successfully!")
    else:
        print("Shoe not found.")
