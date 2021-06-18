import { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import * as fa from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import { Home, User, Transaction } from './page';
import './App.css';

const MySwal = withReactContent(Swal);

class App extends Component {
  constructor(props){
    super(props);
    this.openHelp = this.openHelp.bind(this);
  }

  openHelp = (e) => {
    MySwal.fire({
      html: (
        <div className="center">
          <div className="label">- Link -</div>
          <ul>
            <li>Developer: <a href="https://twitter.com/ys_mdmg" target="_" className="link2">@ys_mdmg&nbsp;<fa.FaTwitter /></a></li>
            <li>Source: <a href="https://github.com/lisknonanika/new-tiplsk" target="_" className="link2">lisknonanika/new-tiplsk&nbsp;<fa.FaGithub /></a></li>
            <li>Explorer: <a href="http://127.0.0.1:4005" target="_" className="link2">Dashboad&nbsp;<fa.FaLink /></a></li>
            <li>Lisk Official: <a href="https://lisk.com" target="_" className="link2">Lisk&nbsp;<fa.FaLink /></a></li>
            <li>Lisk SDK: <a href="https://github.com/LiskHQ/lisk-sdk" target="_" className="link2">LiskHQ/lisk-sdk&nbsp;<fa.FaGithub /></a></li>
          </ul>
        </div>
      ),
      confirmButtonColor: "#3085d6",
      allowOutsideClick: false
    });
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <header className="App-header">
              <Link to="/" className="App-title">TipLSK WEB</Link>
              <div className="App-help"><fa.FaQuestionCircle onClick={this.openHelp}/></div>
            </header>
            <div className="App-contents">
              <Route path="/" exact component={Home} />
              <Route path="/accounts/:userid"  component={User} />
              <Route path="/transactions/:txid"  component={Transaction} />
            </div>
            <footer className="App-footer"></footer>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;