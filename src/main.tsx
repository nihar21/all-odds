import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { apolloClient } from './lib/graphql/client';
import './lib/firebase';
import './index.css';
import { Layout } from './components/Layout';
import { ErrorView } from './components/ErrorView';
import { SportsSelection } from './pages/SportsSelection';
import { SportDetail } from './pages/SportDetail';
import { LeagueDetails } from './pages/LeagueDetails';
import { LiveSports } from './pages/LiveSports';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <Layout>
        <ErrorView
          title="Page not found"
          message="That page doesn't exist. Head back to the sportsbook."
        />
      </Layout>
    ),
    children: [
      { path: '/', element: <SportsSelection /> },
      { path: '/live', element: <LiveSports /> },
      { path: '/sport/:group', element: <SportDetail /> },
      { path: '/sport/:group/league/:leagueKey', element: <LeagueDetails /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
);
