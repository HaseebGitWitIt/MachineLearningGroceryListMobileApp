/*
The dictionary of available sorting methods
for sorting grocery lists.

The items in the dictionary are as follows:
    text: The value of the organization method to be displayed in dropdown boxes
    label: The name of the organization method to be displayed to users
    value: The corresponding value saved to the database

TODO: Might be able to remove labels
*/
const options = [
    {text: "Order Added", label: "Order Added", value: "ORDER_ADDED"},
    {text: "Alphabetically", label: "Alphabetically", value: "ALPHABETICALLY"},
    {text: "By Location", label: "By Location", value: "BY_LOCATION"},
    {text: "Fastest Path", label: "Fastest Path", value: "FASTEST_PATH"},
    {text: "Fastest Path (Auto Update)", label: "Fastest Path (Auto Update)", value: "FASTEST_PATH_AUTO_UPDATE"},
    {text: "Purchased", label: "Purchased", value: "PURCHASED"}
];

export const organizationOptions = options; 