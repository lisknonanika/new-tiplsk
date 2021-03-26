import { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { Home, User, Transaction, HowTo, Information } from './page';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      contentStyle: {paddingTop: ""}
    }
  }

  adjustContents = (e) => {
    this.setState({
      contentStyle: {
        paddingTop: document.querySelector(".App-header").clientHeight + 20 + "px"
      }
    });
  }

  componentDidMount = () => {
    window.addEventListener('load', () => this.adjustContents());
    window.addEventListener('resize', () => this.adjustContents());
  }

  componentWillUnmount = () => {
    window.removeEventListener('load');
    window.removeEventListener('resize');
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <header className="App-header">
              <Link to="/" className="App-link">TipLSKちゃんねる</Link>
            </header>
            <div className="App-contents" style={this.state.contentStyle}>
              <Route path="/" exact component={Home} />
              <Route path="/howto" component={HowTo} />
              <Route path="/information" component={Information} />
              <Route path="/accounts/:userid"  component={User} />
              <Route path="/transactions/:txid"  component={Transaction} />
            </div>
            <footer className="App-footer">
              <Link to="/howto" className="link">HowTo</Link>
              <Link to="/information" className="link">What is TipLSK ?</Link>
            </footer>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;