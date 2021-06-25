import { Component } from 'react';
import { createWSClient } from '@liskhq/lisk-api-client';
import { getBase32AddressFromAddress, getAddressFromBase32Address, hexToBuffer, bufferToHex } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK, convertLSKToBeddows } from '@liskhq/lisk-transactions';
import * as fa from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import { RPC_ENDPOINT, SERVICE_URL, HOST } from '../config';

const MySwal = withReactContent(Swal);
let txId = "";

const createTx = async(client, asset, assetID, passphrase) => {
  const preTx = await client.transaction.create({moduleID: 3000, assetID: assetID, fee: BigInt(0), asset: asset}, passphrase);
  const fee = client.transaction.computeMinFee(preTx);
  const txFee = BigInt(Math.ceil(Number(fee) / 10000) * 10000);
  return await client.transaction.create({moduleID: 3000, assetID: assetID, fee: txFee, asset: asset}, passphrase)
}

class Transaction extends Component {
  constructor(props){
    super(props);
    this.state = { pending: {} }
    this.execute = this.execute.bind(this);
    this.getInfo = this.getInfo.bind(this);
  }

  execute = async(e) => {
    let isConfirmed = false;
    let passphrase = "";

    // enter passphrase
    await MySwal.fire({
      title: "Enter Your Passphrase",
      icon: "info",
      html: (
        <div>
          <div className="alert">To complete this process, enter the passphrase for the following address:</div>
          <div className="label">{this.state.pending.content.senderAddress}</div>
          <div><input type="text" placeholder="passphrase" id="swalPassphrase"/></div>
        </div>
      ),
      showCancelButton: true,
      cancelButtonColor: "#d63230",
      confirmButtonColor: "#3085d6",
      allowOutsideClick: false
    }).then((ret) => {
      isConfirmed = ret? ret.isConfirmed: false;
      passphrase = document.querySelector('#swalPassphrase').value;
    });
    if (!isConfirmed) return;

    passphrase = passphrase.trim().toLowerCase();
    passphrase = passphrase.replace(/\s+/g, " ");

    if (!passphrase || passphrase.split(" ").length !== 12) {
      // passphrase error
      await MySwal.fire({
        title: "Error",
        icon: "error",
        html: (
          <div>
            {!passphrase?<div className="alert">Passphrase is required.</div>:""}
            {passphrase?<div className="alert">Passphrase must be 12 words separated by spaces.</div>:""}
          </div>
        ),
        confirmButtonColor: "#3085d6",
        allowOutsideClick: false
      }).then(async() => {
        await this.execute(e);
      });

    } else {
      // set asset
      let asset = {};
      let assetID = 0;
      if (this.state.pending.content.type === "registration") {
        asset = {
          txId: hexToBuffer(this.state.pending.content.txId),
          type: this.state.pending.content.contentType,
          senderId: this.state.pending.content.senderId,
          address: getAddressFromBase32Address(this.state.pending.content.senderAddress, "tip"),
        }
        assetID = 1;

      } else if (this.state.pending.content.type === "tip") {
        asset = {
          txId: hexToBuffer(this.state.pending.content.txId),
          type: this.state.pending.content.contentType,
          senderId: this.state.pending.content.senderId,
          recipientId: this.state.pending.content.recipientId,
          recipientNm: this.state.pending.content.recipientNm,
          amount: BigInt(+convertLSKToBeddows(this.state.pending.content.amount)),
        }
        assetID = 11;

      } else {
        return;
      }

      // send transaction
      let client = undefined;
      try {
        client = await createWSClient(RPC_ENDPOINT);
        const tx = await createTx(client, asset, assetID, passphrase);
        await client.transaction.send(tx);

        const pending = this.state.pending;
        pending.status = 3
        this.setState({pending: pending});
        setTimeout(async() => {
          await MySwal.fire({
            title: "Complete",
            icon: "success",
            html: (
              <div>
                <div className="label">Transaction ID</div>
                <div className="note">{bufferToHex(tx.id)}</div>
              </div>
            ),
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false
          }).then(() => {
            window.location.href=`${HOST}/accounts/${this.state.pending.content.service.type}-${this.state.pending.content.senderId}`;
          });
        }, 10000);

      } catch (err) {
        await MySwal.fire({
          title: "Error",
          icon: "error",
          html: (
            <div>
              <div className="alert">{err.message? err.message: "system error"}</div>
            </div>
          ),
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false
        });

      } finally {
        if (client) client.disconnect();
      }
    }
  }

  getInfo = async(e) => {
    let client = undefined;
    try {
      const pending = { status: 0, content: [] };
      if (!txId) pending.status = 1;
      this.setState({pending: pending});
      if (pending.status === 1) return;

      // find pending
      client = await createWSClient(RPC_ENDPOINT);
      const pendingTxs = await client.invoke("tiplsk:pendingTx");
      if (!pendingTxs?.tx) {
        pending.status = 1;
        this.setState({pending: pending});
        return;
      }
      const pendingTx = pendingTxs.tx.find(v => v.id === txId);
      if (!pendingTx) {
        pending.status = 1;
        this.setState({pending: pending});
        return;
      }

      // find linkAccount
      let senderAccount = undefined;
      let recipientAccount = undefined;
      const linkAccounts = await client.invoke("tiplsk:linkAccount");
      if (linkAccounts?.link) {
        senderAccount = linkAccounts.link.find(v => v.id === pendingTx.content.senderId);
        recipientAccount = linkAccounts.link.find(v => v.id === pendingTx.content.recipientId);
      }

      // find account
      let balance = "";
      if (senderAccount?.address) {
        const data = await client.account.get(hexToBuffer(senderAccount.address));
        if (data) balance = convertBeddowsToLSK(data.token.balance.toString());
      }

      // set info
      pending.content = {
        txId: pendingTx.id,
        type: pendingTx.type,
        contentType: pendingTx.content.type,
        senderId: pendingTx.content.senderId,
        registeredAddress: senderAccount?.address? getBase32AddressFromAddress(hexToBuffer(senderAccount.address), "tip"): "",
        senderAddress: pendingTx.content.address? getBase32AddressFromAddress(hexToBuffer(pendingTx.content.address), "tip"): "",
        balance: balance? balance: "",
        recipientId: pendingTx.content.recipientId,
        recipientNm: pendingTx.content.recipientNm,
        recipientAddress: recipientAccount?.address? getBase32AddressFromAddress(hexToBuffer(recipientAccount.address), "tip"): "",
        amount: pendingTx.content.amount? convertBeddowsToLSK(pendingTx.content.amount): "",
        service: SERVICE_URL.find(v => v.type === pendingTx.content.type)
      }
      pending.status = 2;
      this.setState({pending: pending});

    } finally {
      if (client) client.disconnect();
    }
  }

  componentDidMount = async() => {
    txId = this.props.match.params.txid;
    this.getInfo();
  }

  render = () => {
    return (
      <div className="center">
        <div className="label">- Pending Transaction -</div>
          {this.state.pending.status === 0? <div className="note">Loading ...</div>: ""}
          {this.state.pending.status === 1? <div className="note">Not Found.</div>: ""}
          {this.state.pending.status === 2?
            <div className="note">
              <div className="card">
                <div className="card-column"><div className="card-columnLabel">Transaction ID</div><div>{this.state.pending.content.txId}</div></div>
                <div className="card-column"><div className="card-columnLabel">Type</div><div>{this.state.pending.content.type}</div></div>
                <div className="card-column">
                  <div className="card-columnLabel">Service&nbsp;<fa.FaLink/></div>
                  <div><a href={this.state.pending.content.service.url} target="_" className="link2">{this.state.pending.content.service.name}</a></div>
                </div>
                <div className="card-column">
                  <div className="card-columnLabel">Sender ID&nbsp;<fa.FaLink/></div>
                  <div><a href={HOST + "/accounts/" + this.state.pending.content.service.type + "-" + this.state.pending.content.senderId} className="link2">{this.state.pending.content.senderId}</a></div>
                </div>
                {this.state.pending.content.type === "registration"?
                  <div>
                    {this.state.pending.content.registeredAddress? <div className="card-column"><div className="card-columnLabel">Sender Address (Registered)</div><div>{this.state.pending.content.registeredAddress}</div></div>: ""}
                    <div className="card-column"><div className="card-columnLabel">Sender Address (New)</div><div>{this.state.pending.content.senderAddress}</div></div>
                  </div>
                :""}
                {this.state.pending.content.type === "tip"?
                  <div>
                    <div className="card-column"><div className="card-columnLabel">Sender Address</div><div>{this.state.pending.content.registeredAddress}</div></div>
                    <div className="card-column"><div className="card-columnLabel">Balance</div><div>{this.state.pending.content.balance} TLSK</div></div>
                    <div className="card-column">
                      <div className="card-columnLabel">Recipient ID&nbsp;<fa.FaLink/></div>
                      <div><a href={HOST + "/accounts/" + this.state.pending.content.service.type + "-" + this.state.pending.content.recipientId} className="link2">{this.state.pending.content.recipientId}</a></div>
                    </div>
                    <div className="card-column"><div className="card-columnLabel">Recipient Name</div><div>{this.state.pending.content.recipientNm}</div></div>
                    <div className="card-column"><div className="card-columnLabel">Recipient Address</div><div>{this.state.pending.content.recipientAddress}</div></div>
                    <div className="card-column"><div className="card-columnLabel">Amount</div><div>{this.state.pending.content.amount}</div></div>
                  </div>
                :""}
              </div>
            </div>
          :""}
          {this.state.pending.status === 3? 
            <div>
              <div className="note">Processing ...</div>
              <div className="note">Please wait for about 10 seconds.</div>
            </div>
          : ""}
          {this.state.pending.status === 2?
            <div className="note">
              <button className="execute" onClick={this.execute}>Execute&nbsp;<fa.FaPaperPlane/></button>
            </div>
          :""}
          {this.state.pending.status !== 3?
          <div className="note">
            <button onClick={this.getInfo}>Reload&nbsp;<fa.FaRedoAlt/></button>
          </div>
          :""}
      </div>
    );
  }
}

export default Transaction;