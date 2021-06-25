import { Component } from 'react';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import { getBase32AddressFromPassphrase } from '@liskhq/lisk-cryptography';
import * as fa from 'react-icons/fa';
import '../App.css';

const MySwal = withReactContent(Swal);

class Home extends Component {
  constructor(props){
    super(props);
    this.getAddressAndPassphrase = this.getAddressAndPassphrase.bind(this);
    this.copyText = this.copyText.bind(this);
  }

  getAddressAndPassphrase = (e) => {
    const passphrase = Mnemonic.generateMnemonic();
    const address = getBase32AddressFromPassphrase(passphrase, "tip");
    MySwal.fire({
      title: "Generated your account",
      icon: "success",
      html: (
        <div>
          <div className="copy-text">
            <div className="copy-icon"><fa.FaCopy/></div>
            <textarea value={`<address>\r\n${address}\r\n\r\n<passphrase>\r\n${passphrase}`} readOnly onClick={this.copyText} rows="8"/>
          </div>
          <div className="alert note">* Don't forget your passphrase.</div>
        </div>
      ),
      confirmButtonColor: "#3085d6",
      allowOutsideClick: false
    });
  }

  copyText = (e) => {
    if (!e.target.value) return;
    e.target.select();
    document.execCommand('copy');
    window.alert("copied!")
  }

  render = () => {
    return (
      <div className="center">
        <div className="label">- What's TipLSK? -</div>
        <div className="note">
          <div>This service running on the blockchain built by Lisk SDK.</div>
          <div>You can send and receive tokens via SNS etc.</div>
        </div>

        <div className="label">- Available -</div>
        <div className="note">
          <div>Discord: <a href="https://discord.gg/dkejVnjCQZ" target="_" className="link2">mdmg work&nbsp;<fa.FaDiscord/></a></div>
          <div>*Join and send a DM to TipLSK and say "-h".</div>
        </div>

        <div className="note">
          <div><button onClick={this.getAddressAndPassphrase}>Generate TipLSK Address</button></div>
        </div>
      </div>
    );
  }
}

export default Home;