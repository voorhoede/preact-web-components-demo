import { register } from "../../lib/register";
import { Alert } from "./Alert.jsx";
import alertStyles from "./Alert.css?inline";

register({
    component: Alert,
    tagName: "acme-alert",
    propNames: ["type"],
    eventNames: ["onDismiss"],
    styles: [alertStyles],
    shadow: true,
})