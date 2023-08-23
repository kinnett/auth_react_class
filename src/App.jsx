import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';
import { PageLayout } from './components/PageLayout';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated, useMsalAuthentication } from '@azure/msal-react';
import Button from 'react-bootstrap/Button';

import { ProfileData } from './components/ProfileData';
import { InteractionType } from '@azure/msal-browser';
import { LogLevel } from "@azure/msal-browser";

/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */


