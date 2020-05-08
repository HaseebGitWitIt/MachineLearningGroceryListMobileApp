/*
The dictionary of available departments used
for adding items to stores and creating maps.
The keys in the dictionary are the names of
the departments.
The items in the dictionary are as follows:
    text: The value of the department to be displayed in dropdown boxes
    label: The name of the department to be displayed to users
    value: The corresponding value saved to the database

TODO: Might be able to remove labels
*/
const departmentList = [
    {text: "Bakery", label: "Bakery", value: "Bakery", colour: "#f9a566"},
    {text: "Baking Ingredients", label: "Baking Ingredients", value: "Baking Ingredients", colour: "#79abb6"},
    {text: "Beef And Poultry", label: "Beef And Poultry", value: "Beef And Poultry", colour: "#945947"},
    {text: "Beer And Wine", label: "Beer And Wine", value: "Beer And Wine", colour: "#e75d72"},
    {text: "Breakfast Foods", label: "Breakfast Foods", value: "Breakfast Foods", colour: "#0ffecd"},
    {text: "Bulk Foods", label: "Bulk Foods", value: "Bulk Foods", colour: "#424f45"},
    {text: "Canned Foods", label: "Canned Foods", value: "Canned Foods", colour: "#b4419e"},
    {text: "Cleaning Supplies", label: "Cleaning Supplies", value: "Cleaning Supplies", colour: "#ca7c14"},
    {text: "Coffee And Tea", label: "Coffee And Tea", value: "Coffee And Tea", colour: "#c6ee57"},
    {text: "Condiments", label: "Condiments", value: "Condiments", colour: "#67f6f4"},
    {text: "Cooking Essentials", label: "Cooking Essentials", value: "Cooking Essentials", colour: "#a67e94"},
    {text: "Dairy", label: "Dairy", value: "Dairy", colour: "#e692cf"},
    {text: "Deli", label: "Deli", value: "Deli", colour: "#f61dfc"},
    {text: "Desserts", label: "Desserts", value: "Desserts", colour: "#623286"},
    {text: "Drinks", label: "Drinks", value: "Drinks", colour: "#617dfa"},
    {text: "Frozen Foods", label: "Frozen Foods", value: "Frozen Foods", colour: "#4287f5"},
    {text: "Health Foods", label: "Health Foods", value: "Health Foods", colour: "#ef2724"},
    {text: "Kitchen Of The World", label: "Kitchen Of The World", value: "Kitchen Of The World", colour: "#cec579"},
    {text: "Meal Replacements", label: "Meal Replacements", value: "Meal Replacements", colour: "#f3ab06"},
    {text: "Meals To Go", label: "Meals To Go", value: "Meals To Go", colour: "#08ddb0"},
    {text: "Paper Products", label: "Paper Products", value: "Paper Products", colour: "#5a8544"},
    {text: "Pet Supplies", label: "Pet Supplies", value: "Pet Supplies", colour: "#ee51d0"},
    {text: "Pharmacy", label: "Pharmacy", value: "Pharmacy", colour: "#347841"},
    {text: "Produce", label: "Produce", value: "Produce", colour: "#33ba66"},
    {text: "Seafood", label: "Seafood", value: "Seafood", colour: "#f73d81"},
    {text: "Snack Foods", label: "Snack Foods", value: "Snack Foods", colour: "#abb63b"},
    {text: "Soup", label: "Soup", value: "Soup", colour: "#6148ae"},
    {text: "Sports", label: "Sports", value: "Sports", colour: "#3a281c"},
    {text: "Whole Body", label: "Whole Body", value: "Whole Body", colour: "#60fc9c"},
];

export const departments = departmentList;