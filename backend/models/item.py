class Item:
    def __init__(self, name, description, price, category):
        self.name = name
        self.description = description
        self.price = price
        self.category = category

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "category": self.category
        }