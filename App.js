import * as React from 'react';
import {StyleSheet, Text, View, ScrollView, TextInput, Button, AsyncStorage, Clipboard} from 'react-native';
import {useEffect, useState} from "react";
import Web3 from "web3";
import ModalDropdown from 'react-native-modal-dropdown';
import HDWallet from 'ethereum-hdwallet';

const erc20Abi = require("./ERC20.json");

export default function App() {
    const [ethBalance, setEthBalance] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [privateKeys, setPrivateKeys] = useState([]);
    const [myTokenBalance, setMyTokenBalance] = useState(0);
    const [token, setToken] = useState(null);
    const [mnemonic, setMnemonic] = useState("");
    const [privateKeyInput, setPrivateKeyInput] = useState("");

    const saveData = () => {
        AsyncStorage.setItem('jsondata', JSON.stringify({}));
    };

    const loadData = async () => {
        const dataString = await AsyncStorage.getItem('jsondata')
    };

    const updateInfo = () => {
        if (!!web3) {
            web3.eth.getBalance(account.address).then((balance) => {
                setEthBalance(balance);
            });
            if (!!token && !!account) {
                token.methods.balanceOf(account.address).call().then((bal) => {
                    setMyTokenBalance(bal);
                });
            }
        }
    };

    useEffect(() => {
        updateInfo();
    }, [account]);


    const createAccount = (privateKey) => {
        console.log(privateKey);
        const acc = web3.eth.accounts.privateKeyToAccount(privateKey);
        console.log(acc);
        setAddresses([...addresses, acc.address]);
        setPrivateKeys([...privateKeys, privateKey]);
    };

    const createRandomKey = () => {
        createAccount(web3.utils.randomHex(32));
    };

    const createFromMnemonic = async () => {
        const seed = Buffer.from(mnemonic, 'hex')
        const hdwallet = HDWallet.fromSeed(seed)
        const privateKey = `0x${hdwallet.derive(`m/44'/60'/0'/0/0`).getAddress().toString('hex')}`;
        createAccount(privateKey);
    };

    const createFromPrivateKey = () => {
        createAccount(privateKeyInput);
    };

    const init = () => {
        console.log("init web3");
        const web3Instance = new Web3("https://goerli.infura.io/v3/33beb15f6748419fbb8b16ddf1420b31");
        setWeb3(web3Instance);
        const tokenInstance = new web3Instance.eth.Contract(erc20Abi.abi, "0x1fFE9c7110Bb3A07463bE5EBA80BD40F03EB3e3e");
        setToken(tokenInstance);
    };

    useEffect(() => {
        init();
    }, []);

    const copyAll = () => {
        Clipboard.setString('mail@mail.com');
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text>Embedded web3 wallet</Text>
                <Text/>
                <Button
                    onPress={copyAll}
                    title="Copy token address, private keys, addresses to clipboard"
                    color="#841584"
                />

                <Text/>

                <Button
                    onPress={createRandomKey}
                    title="Create random"
                />

                <Text>Mnemonic:</Text>
                <TextInput style={styles.textInput} onChangeText={setMnemonic} defaultValue={mnemonic}/>
                <Button
                    onPress={createFromMnemonic}
                    title="Add mnemonic"
                />
                <Text>Private key:</Text>
                <TextInput style={styles.textInput} onChangeText={setPrivateKeyInput} defaultValue={privateKeyInput}/>
                <Button
                    onPress={createFromPrivateKey}
                    title="Add private key"
                />

                <Text>Select account:</Text>
                <ModalDropdown style={styles.dropDown} options={addresses} onSelect={console.log}/>
                <Text>My balance: {ethBalance} ETH</Text>

                <Text/>
                <Text>Token: {token ? token._address : ""}</Text>
                <Text/>

                <Button
                    onPress={() => {
                    }}
                    title="Mint 1000 tokens to me"
                />
                <Text>My token balance: {myTokenBalance}</Text>

                <Text/>

                <Text>Balance of:</Text>
                <TextInput style={styles.textInput}/>
                <Button
                    onPress={() => {
                    }}
                    title="Update"
                />
                <Text>balance: {myTokenBalance}</Text>

                <Text/>

                <Text>Transfer token to address:</Text>
                <TextInput style={styles.textInput}/>
                <Text>Amount:</Text>
                <TextInput style={styles.textInput}/>
                <Button
                    onPress={() => {
                    }}
                    title="Transfer"
                />
                <Text>Result</Text>

                <Text/>

                <Text>Transfer eth to address:</Text>
                <TextInput style={styles.textInput}/>
                <Text>Amount:</Text>
                <TextInput style={styles.textInput}/>
                <Button
                    onPress={() => {
                    }}
                    title="Transfer eth"
                />
                <Text>Result</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    textInput: {
        borderColor: "#000",
        borderWidth: 1,
        height: 40,
        width: 300,
        padding: 10
    },
    dropDown: {
        height: 40,
        backgroundColor: "#ccc",
    }
});
