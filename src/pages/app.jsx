import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Visual log Demo | Visual Log </title>
      </Helmet>

      <AppView />
    </>
  );
}
