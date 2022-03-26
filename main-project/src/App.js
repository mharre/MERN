import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import UserPlaces from './places/pages/UserPlaces';
import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UpdatePlace from './places/pages/UpdatePlace';

function App() {
  return (
    <Router>
      <MainNavigation />
        <main>
          <Switch>
            <Route path='/' exact>
              <Users />
            </Route>
            <Route path='/:userId/places' exact>
              <UserPlaces />
            </Route>
            <Route path='/places/new' exact>
              <NewPlace />
            </Route>
            <Route path='/places/:placeId'> 
              <UpdatePlace />
            </Route>
            <Redirect to='/' />
          </Switch>
        </main>
    </Router>
  )
}

export default App;

// order of routes in /places/new and /places/:placeId matters
// if /:placeId was first react would still interpret /places/new the same as /places/:placeId because of the dynamic url
// /places/new which renders NewPlace would never be matched at that point so the order is important
