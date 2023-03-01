import './App.css';

import Collection from "./Collection.js";
import SaleCollection from "./SaleCollection.js";

import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {useState, useEffect} from 'react';
import {create} from 'ipfs-http-client';
import {mintNFT} from "./cadence/transactions/mint_nft.js";
import {setupUserTx} from "./cadence/transactions/setup_user.js";
import {listForSaleTx} from "./cadence/transactions/list_for_sale.js";
import {unlistFromSaleTx} from "./cadence/transactions/unlist_from_sale.js";

const client = create('https://ipfs.infura.io:5001/api/v0');

fcl.config()
  .put("accessNode.api", "https://access-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

function App() {
  const [user, setUser] = useState();
  const [nameOfNFT, setNameOfNFT] = useState('');
  const [file, setFile] = useState();
  const [id, setID] = useState();
  const [price, setPrice] = useState();
  const [address, setAddress] = useState();
  const [officialAddress, setOfficialAddress] = useState('');

  useEffect(() => {
    // sets the `user` variable to the person that is logged in through Blocto
    fcl.currentUser().subscribe(setUser);
  }, [])

  const logIn = () => {
    // log in through Blocto
    fcl.authenticate();
  }

  const mint = async () => {

    try {
      const added = await client.add(file)
      const hash = added.path;

      const transactionId = await fcl.send([
        fcl.transaction(mintNFT),
        fcl.args([
          fcl.arg(hash, t.String),
          fcl.arg(nameOfNFT, t.String)
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999)
      ]).then(fcl.decode);
  
      console.log(transactionId);
      return fcl.tx(transactionId).onceSealed();
    } catch(error) {
      console.log('Error uploading file: ', error);
    }
  }

  const setupUser = async () => {
    const transactionId = await fcl.send([
      fcl.transaction(setupUserTx),
      fcl.args([]),
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  }

  const listForSale = async () => {
    const transactionId = await fcl.send([
      fcl.transaction(listForSaleTx),
      fcl.args([
        fcl.arg(parseInt(id), t.UInt64),
        fcl.arg(price, t.UFix64)
      ]),
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  }

  const unlistFromSale = async () => {
    const transactionId = await fcl.send([
      fcl.transaction(unlistFromSaleTx),
      fcl.args([
        fcl.arg(parseInt(id), t.UInt64)
      ]),
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  }

  return (
    <div className="App">
      

      <header><img src="https://i.imgur.com/I7zCDR8.png" alt='main logo' height='50px'/>
      <p className='address-area'>Account address: {user && user.addr ? user.addr : 'Not connected'}</p></header>
      
      <section className='top-button-area'>
      <button className='button-top' onClick={() => logIn()}>Log In</button>
      <button className='button-top' onClick={() => fcl.unauthenticate()}>Log Out</button>
      <button className='button-top' onClick={() => setupUser()}>Setup User</button>
      </section>

      <div className='wrapper-section'> </div>
      <section className='mint-nft-section'>
      <div className='mint-nft-area'>
        <h3>Mint NFT</h3> 
        <input type="text" title='Name of NFT' onChange={(e) => setNameOfNFT(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={() => mint()}>Mint</button>
      </div>

      <div className='mint-nft-area'>
      <h3>Bridge NFT</h3>
<div className='label'>
  <label for="from_nft">Source Chain : </label>
  <select name="from_nft" id="from_nft">
      <option value="edg">Edgeware</option>
      <option value="flow">Flow</option>
      <option value="eth">Ethereum</option>
  </select>
</div>

<div className='label'>
  <label for="dest_chain">Destination Chain : </label>
  <select name="dest_chain" id="from_nft">
      
      <option value="flow">Flow</option>
      <option value="edg">Edgeware</option>
      <option value="eth">Ethereum</option>
  </select>
  </div>
        <button onClick={() => setOfficialAddress(address)}>Bridge</button>
      </div>

      </section>

      <section className='mint-nft-section'> 
      <div className='mint-nft-area'>
      <h3>List an NFT for Sale</h3>
      <input type="text" onChange={(e) => setID(e.target.value)} />
        <button onClick={() => listForSale()}>List</button>
        </div>

      <div className='mint-nft-area'>
      <h3>Unlist an NFT from Sale</h3>
        <input type="text" onChange={(e) => setPrice(e.target.value)} />
        <button onClick={() => unlistFromSale()}>Unlist</button>
        </div>

      { user && user.addr && officialAddress && officialAddress !== ''
        ?
        <Collection address={officialAddress}></Collection>
        :
        null
      }

      { user && user.addr && officialAddress && officialAddress !== ''
        ?
        <SaleCollection address={officialAddress}></SaleCollection>
        :
        null
      }

<div className='mint-nft-area'>
      <h3>Search NFT</h3>
      <input type="text" title='Enter Name of NFT' onChange={(e) => setAddress(e.target.value)} />
        <button onClick={() => setOfficialAddress(address)}>Search</button>
      </div>
      </section>

      
      
    </div> 
  );
}

export default App;