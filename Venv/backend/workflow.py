import json



def transition_state(order, data, manual_trigger=False):
    with open("schema.json") as f:
        schema = json.load(f)
    transitions = schema.get("workflow", {}).get("transitions", {})
    rule = transitions.get(current_state)

    current_state = order.get("current_state")

    if not rule:
         return order

    if order["current_state"] not in transitions:
            return order
    
    target_state = rule.get("next")
    condition = rule.get("condition", {})

    if condition.get("onClick") and not manual_trigger:
         return order
    
    component_type = condition.get("field")[0]
    field = component_type.get("field")[1]
    comp = next((c for c in data["components"] if c["component"] == component_type), None)
    if not comp:
         return order
    
    # assuming comp is customers
    user_id = data.get("information", {}).get("current_userId")
    customer = next((c for c in comp["data"] if c.get("customer_id") == user_id))
    
    
    



