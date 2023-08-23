import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 */
