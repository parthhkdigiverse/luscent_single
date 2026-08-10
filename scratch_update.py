
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['luscent']

faqs = [
    {
        'question': 'Is this sunscreen suitable for oily skin?',
        'answer': 'Yes, our Ultra Light Sunscreen is specially formulated to be non-greasy and lightweight, making it perfect for oily and acne-prone skin types.'
    },
    {
        'question': 'Does it leave a white cast?',
        'answer': 'No, it absorbs completely transparently into all skin tones without leaving any white residue behind.'
    },
    {
        'question': 'How often should I reapply?',
        'answer': 'We recommend reapplying every 2-3 hours for optimal protection, especially if you are outdoors, sweating, or swimming.'
    }
]

result = db.products.update_one(
    {'slug': 'sunscreen'},
    {'': {'faqs': faqs}}
)

print(f'Matched: {result.matched_count}, Modified: {result.modified_count}')

