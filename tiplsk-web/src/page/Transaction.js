import { Component } from 'react';
import { createWSClient } from '@liskhq/lisk-api-client';
import { getBase32AddressFromAddress, bufferToHex } from '@liskhq/lisk-cryptography';
import { convertBeddowsToLSK } from '@liskhq/lisk-transactions';
import * as fa from 'react-icons/fa';
import { RPC_ENDPOINT, SERVICE_URL } from '../config';

let txId = "";

class Transaction extends Component {
  constructor(props){
    super(props);
    this.state = { account: {}, pending: {} }
    this.getPendingInfo = this.getPendingInfo.bind(this);
  }

  getPendingInfo = async(e) => {
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
      const pendingTx = pendingTxs.tx.find(v => bufferToHex(v.id) === txId);
      if (!pendingTx) {
        pending.status = 1;
        this.setState({pending: pending});
        return;
      }

      // set pending info
      pending.content = {
        txId: bufferToHex(pendingTx.id),
        type: pendingTx.type,
        contentType: pendingTx.content.type,
        senderId: pendingTx.content.senderId,
        recipientId: pendingTx.content.recipientId,
        recipientNm: pendingTx.content.recipientNm,
        address: pendingTx.content.address? getBase32AddressFromAddress(Buffer.from(pendingTx.content.address), "tip"): "",
        amount: pendingTx.content.amount?convertBeddowsToLSK(pendingTx.content.amount): "",
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
    this.getPendingInfo();
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
                <div className="card-column"><div className="card-columnLabel">Sender Id</div><div>{this.state.pending.content.senderId}</div></div>
                {this.state.pending.content.recipientId? <div className="card-column"><div className="card-columnLabel">Recipient Id</div><div>{this.state.pending.content.recipientId}</div></div>: ""}
                {this.state.pending.content.recipientNm? <div className="card-column"><div className="card-columnLabel">Recipient Name</div><div>{this.state.pending.content.recipientNm}</div></div>: ""}
                {this.state.pending.content.address? <div className="card-column"><div className="card-columnLabel">Address</div><div>{this.state.pending.content.address}</div></div>: ""}
                {this.state.pending.content.amount? <div className="card-column"><div className="card-columnLabel">Amount</div><div>{this.state.pending.content.amount}</div></div>: ""}
              </div>
            </div>
          :""}
          <div className="note">
            <button onClick={this.getPendingInfo}>Reload&nbsp;<fa.FaRedoAlt/></button>
          </div>
      </div>
    );
  }
}

export default Transaction;