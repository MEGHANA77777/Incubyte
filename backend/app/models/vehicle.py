from datetime import datetime


class Vehicle:
    """Domain model — not persisted directly; used for type clarity."""

    def __init__(
        self,
        id: str,
        make: str,
        model: str,
        category: str,
        price: float,
        quantity: int,
        created_at: datetime,
        updated_at: datetime,
    ) -> None:
        self.id = id
        self.make = make
        self.model = model
        self.category = category
        self.price = price
        self.quantity = quantity
        self.created_at = created_at
        self.updated_at = updated_at
