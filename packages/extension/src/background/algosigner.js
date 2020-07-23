'use strict';
const algosdk = require("algosdk");
import  extensionStorage from "@algosigner/storage/dist/extensionStorage";
import encryptionWrap from "./encryptionWrap";
import createNewAccount from "./account/createAccount.js";
import { signTransaction } from "./transaction/actions";
import { TransactionType } from "@algosigner/common/types/transaction";

document.addEventListener('DOMContentLoaded', () => {
    const _defaultPassphrase = "Password1";
    const _accountKey = "defaultwalletname";

    let dev_area = document.getElementById('dev_area');
    let public_key = document.getElementById('public_key');
    let keywrap = document.getElementById('keywrap');

    let input_password = document.getElementById('input_password');
    let login_button = document.getElementById('login_button');

    let create_wallet = document.getElementById('create_wallet');

    let signtest = document.getElementById('signtest');

    // Get input passphrase
    function getInputPassphrase() {
        return input_password && input_password.value !== "" ? input_password.value : _defaultPassphrase;
    };

    if(login_button) // Button exists on extension, so load the others. Testing only.
    {
        // Testing Method: Get storage.local information for extension
        get_local.onclick = function(element){
            extensionStorage.getStorageLocal((result) => {
                dev_area.value = result;
            })
        }

        // Testing Method: Delete all storage.local for extension
        clear_local.onclick = function(element){
            extensionStorage.clearStorageLocal((result) => {
                console.log("Clear result: " + result);
                dev_area.value = result ? 'Success' : 'Failed';
            })
        }

        // Unlock the storage.local object
        login_button.onclick = function(element) {
            dev_area.value = 'Attempting unlock...';
            let context = new encryptionWrap(getInputPassphrase());
            context.unlock((unlockedValue) => {
                if(unlockedValue && unlockedValue['STATUS']){
                    dev_area.value = unlockedValue['STATUS'];
                }
                else if(unlockedValue){
                    dev_area.value = unlockedValue;
                }
                else
                    dev_area.value = `Login failed.`;
            });
        };

        // Testing Method: Deleted current storage.local, create a new mnemonic, and save
        create_wallet.onclick = function(element) {
            dev_area.value = "";
            let accountArray = createNewAccount(getInputPassphrase());
            dev_area.value += `Mnemonic:\n${accountArray[0]}`;
            public_key.textContent = accountArray[1];
            keywrap.classList.remove("hidden-row");
            let context = new encryptionWrap(getInputPassphrase());
            context.lock(JSON.stringify(accountArray),
            (isSuccessful) => {
                console.log(`Lock was successful? ${isSuccessful}`);
                if(isSuccessful){
                    dev_area.value += `\n\nLocked value set.`;
                    login_button.classList.remove("hidden-row");
                }
                else{
                    dev_area.value += `\n\nLocked value failed to save.`;
                }
            });
        };

        // Check default account key in local storage
        extensionStorage.noAccountExistsCheck(_accountKey, (isAccount) => {
            if(!isAccount){
                dev_area.value = 'No previous account found, use Create New Wallet.';
                login_button.classList.add("hidden-row");
            }
        }); 
        
        signtest.onclick = function(element) {
            // TODO: BC - Remove these defaults for other use
            throw new Error("Setup default values in algosigner.js and comment this out for testing.");
            const baseServer = ""
            const port = "";
            const token = { 'x-api-key': '' }
            const toaddress = ''

            let algodclient = new algosdk.Algod(token, baseServer, port);
            (async () => { await algodclient.getTransactionParams().then((params)=>{ 
                signTransaction({
                    "to": toaddress,
                    "fee": 10,
                    "amount": 4190,
                    "firstRound": params.lastRound,
                    "lastRound": params.lastRound + 1000,
                    "genesisID": params.genesisID,
                    "genesisHash": params.genesishashb64.toString(),
                    "closeRemainderTo": undefined,
                    "note": new Uint8Array(Buffer.from(algosdk.encodeObj(""), "base64"))
                }, TransactionType.Pay);
                }).then(signed => {console.log(signed);});
            })();
        }
    }
}, false);