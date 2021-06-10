import { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { Home, User, Transaction, Help } from './page';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      contentStyle: {paddingTop: ""}
    }
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <header className="App-header">
              <Link to="/" className="App-title App-link">TipLSK WEB</Link>
            </header>
            <div className="App-contents" style={this.state.contentStyle}>
              <Route path="/" exact component={Home} />
              <Route path="/help" component={Help} />
              <Route path="/accounts/:userid"  component={User} />
              <Route path="/transactions/:txid"  component={Transaction} />
            </div>
            <footer className="App-footer">
              <Link to="/help" className="link">Help</Link>
            </footer>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;