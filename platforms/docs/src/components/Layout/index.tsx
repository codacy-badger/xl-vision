import { createGlobalStyles, styled } from '@xl-vision/react';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Aside from '../Aside';
import Footer from '../Footer';
import Header from '../Header';
import Main from '../Main';
import ThemeProvider from '../ThemeProvider';

const GlobalStyle = createGlobalStyles(
  ({ theme }) => `
  html,body {
    margin: 0;
    width: 100%;
    min-height: 100%;
    background: ${theme.color.background};
    color: ${theme.color.text.primary}
  }

  #app {
    min-height: 100%;
  }
`,
);

const Content = styled('div')`
  display: flex;
  height: 100%;
  > main {
    margin-left: 16px;
    margin-top: 16px;
    flex: 1;
    overflow-x: auto;
  }
`;

const Layout = () => {
  return (
    <ThemeProvider>
      <Router>
        <GlobalStyle />
        <Header />
        <Content>
          <Aside />
          <Main />
        </Content>
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default Layout;
