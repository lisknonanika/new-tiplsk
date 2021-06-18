import { Component } from 'react';
import { createWSClient } from '@liskhq/lisk-api-client';
import { getBase32AddressFromAddress, bufferToHex } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK } from '@liskhq/lisk-transactions';
import * as fa from 'react-icons/fa';
import { RPC_ENDPOINT, HOST, SERVICE_URL } from '../config';

let type = "";
let id = "";

class User extends Component {
  constructor(props){
    super(props);
    this.state = { account: {}, pending: {} }
    this.getUserInfo = this.getUserInfo.bind(this);
    this.getPendingInfo = this.getPendingInfo.bind(this);
  }

  getUserInfo = async(e) => {
    let client = undefined;
    try {
      const account = {status: 0, content: {}}
      if (!type || !id) account.status = 1;
      this.setState({account: account});
      if (account.status === 1) return;

      // get Pending
      this.getPendingInfo();

      // find link account
      client = await createWSClient(RPC_ENDPOINT);
      const linkAccounts = await client.invoke("tiplsk:linkAccount");
      let linkAccount;
      if (linkAccounts?.link) linkAccount = linkAccounts.link.find(v => v.type === type && v.id === id);
      if (!linkAccount) {
        account.status = 1;
        this.setState({account: account});
        return;
      }

      // find account
      const bufferAddress = Buffer.from(linkAccount.address);
      const data = await client.account.get(bufferAddress);
      if (!data) {
        account.status = 1;
        this.setState({account: account});
        return;
      }
      
      // set account info
      account.content = {
        type: linkAccount.type,
        id: linkAccount.id,
        address: getBase32AddressFromAddress(bufferAddress, "tip"),
        balance: convertBeddowsToLSK(data.token.balance.toString()),
        service: SERVICE_URL.find(v => v.type === linkAccount.type)
      }
      account.status = 2;
      this.setState({account: account});

    } finally {
      if (client) client.disconnect();
    }
  }

  getPendingInfo = async(e) => {
    let client = undefined;
    try {
      const pending = { status: 0, content: [] };
      if (!type || !id) pending.status = 1;
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
      const pendingTx = pendingTxs.tx.filter(v => v.content.type === type && v.content.senderId === id);
      if (pendingTx.length === 0) {
        pending.status = 1;
        this.setState({pending: pending});
        return;
      }

      // set pending info
      for (const pend of pendingTx) {
        const pendingContent = {
          txId: bufferToHex(pend.id),
          type: pend.type,
          recipientNm: pend.content.recipientNm,
          address: pend.content.address? getBase32AddressFromAddress(Buffer.from(pend.content.address), "tip"): "",
          amount: pend.content.amount?convertBeddowsToLSK(pend.content.amount): ""
        }
        pending.content.push(pendingContent);
      }
      pending.status = 2;
      this.setState({pending: pending});

    } finally {
      if (client) client.disconnect();
    }
  }

  componentDidMount = async() => {
    type = "";
    id = "";
    const userid = this.props.match.params.userid;
    if (userid && userid.split("-").length === 2) {
      type = userid.split("-")[0];
      id = userid.split("-")[1];
    }
    this.getUserInfo();
  }

  render = () => {
    return (
      <div className="center">
        <div className="label">- Account -</div>
        {this.state.account.status === 0? <div className="note">Loading ...</div>: ""}
        {this.state.account.status === 1? <div className="note">Not Found.</div>: ""}
        {this.state.account.status === 2?
          <div>
            <div className="note">
              <div className="card">
                <div className="card-column">
                  <div className="card-columnLabel">Service&nbsp;<fa.FaLink/></div>
                  <div><a href={this.state.account.content.service.url} target="_" className="link2">{this.state.account.content.service.name}</a></div>
                </div>
                <div className="card-column"><div className="card-columnLabel">ID</div><div>{this.state.account.content.id}</div></div>
                <div className="card-column"><div className="card-columnLabel">Address</div><div>{this.state.account.content.address}</div></div>
                <div className="card-column"><div className="card-columnLabel">Balance</div><div>{this.state.account.content.balance}&nbsp;TLSK</div></div>
              </div>
            </div>
          </div>
        :""}
        <div className="note">
          <button onClick={this.getUserInfo}>Reload&nbsp;<fa.FaRedoAlt/></button>
        </div>
        {this.state.account.status === 1?
          <div>
            <hr></hr>
            <div className="label">- Pending -</div>
            {this.state.pending.status === 0? <div className="note">Loading ...</div>: ""}
            {this.state.pending.status === 1? <div className="note">Not Found.</div>: ""}
            {this.state.pending.status === 2?
              <div>
              {(()=>{
                for (const info of this.state.pending.content) {
                  return (
                  <div className="note">
                    <div className="card">
                      <div className="card-column">
                        <div className="card-columnLabel">TransactionID&nbsp;<fa.FaLink/></div>
                        <div><a href={HOST + "/transactions/" + info.txId} target="_" className="link2">{info.txId}</a></div>
                      </div>
                      <div className="card-column"><div className="card-columnLabel">Type</div><div>{info.type}</div></div>
                      {info.recipientNm? <div className="card-column"><div className="card-columnLabel">Recipient Name</div><div>{info.recipientNm}</div></div>: ""}
                      {info.address? <div className="card-column"><div className="card-columnLabel">Address</div><div>{info.address}</div></div>: ""}
                      {info.amount? <div className="card-column"><div className="card-columnLabel">Amount</div><div>{info.amount}</div></div>: ""}
                    </div>
                  </div>
                  );
                }
              })()}
              </div>
            :""}
            <div className="note">
              <button onClick={this.getPendingInfo}>Reload&nbsp;<fa.FaRedoAlt/></button>
            </div>
          </div>
        :""}
      </div>
    );
  }
}

export default User;