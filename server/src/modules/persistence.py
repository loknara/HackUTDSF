import os
from typing import List, Dict, Union


class Persistence:
    claims = []

    @classmethod
    def create_user(cls) -> None:
        cls.user = {
            "name": "Lokesh Narasani",
            "business_name": "Lokesh's Car Service",
            "email": "lokeshnarasani@gmail.com",
            "birthday": "2003-01-13",
        }
        return cls.user

    @classmethod
    def get_all_claims(cls) -> List[Dict[str, Union[str, int]]]:
        return cls.claims

    @classmethod
    def insert_claim(cls, claim: Dict[str, Union[str, int]]) -> None:
        cls.claims.append(claim)

    @classmethod
    def initialize(cls) -> None:
        cls.create_user()
        cls.insert_claim({
            "id": "NBD37",
            "model": "Manual",
            "description": "Car Accident",
            "date": "2023-11-05",
            "amount": 1000,
            "status": "Closed",
            "summary": "Lokesh got into an accident on his way to work. He has the drivers policy, so he should be covered.",
            "transcript": "Lokesh: I was driving to work and I got into an accident. I have the drivers policy, so I should be covered.\nAssociate: Sounds good, thank you.",
        })


if __name__ == "__main__":
    Persistence.initialize()
