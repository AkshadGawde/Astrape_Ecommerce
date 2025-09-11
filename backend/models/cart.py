class CartItem:
    def __init__(self, user_id, item_id, quantity=1):
        self.user_id = user_id
        self.item_id = item_id
        self.quantity = quantity

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "item_id": self.item_id,
            "quantity": self.quantity
        }