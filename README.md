Front-end UI components rendered by backend json files with no HTML/CSS.

In this project, I wrote code for creating UI components that visualize a order processing system on an e-commerce platform.


Instructions:

1. `git clone https://github.com/ejy921/SDUI.git`
2. `cd SDUI`
3. `python -m venv Venv`
4. `Venv\Scripts\activate (for Windows), Venv/bin/activate (for Mac)`
5. `pip install -r requirements.txt`


Structure:

The schema.json contains the customer list and the list of products in the store.
The PostgreSQL database contains the customer list, product list, order details, and workflow details.
It obtains customer and product data by parsing through schema.json.

** workflow.py is still under making to piece the logic together
