'use client'
import React, { useEffect, useState } from 'react'
import { Grid, GridItem, Box, Text, Button, Heading } from "@chakra-ui/react"
import  CardERC721  from "./CardERC721"
import { Contract, ethers } from 'ethers'
import { HxTokenAddress, MarketAddress,account1, account2, pk1, pk2,rpc_url } from "../utils/constant"

const abiJSON = require("../abi/MyMarket.json")
const abi_market = abiJSON.abi


enum State { Created, Release, Inactive }
interface ItemInfo{
  id:Number,
  address_nftContract:string,
  tokenId:Number,
  seller:string,
  buyer:string,
  price:Number,
  state:State
  }
declare let window:any

export default function DisplayMyOwnNft(){
    const [items, setItems] = useState<ItemInfo[]>([])
    const [currentAccount, setCurrentAccount] = useState<string | undefined>()
    const [signer, setSigner] = useState<any>()
    const [show, setShow] = useState<boolean>(false)
    const[content, setContent] = useState<string>("DisplayMyNft(on sale)")
    function handle(){
        setShow(!show)
        if(!show){
            setContent("HideMyOwnNft")
        }else{
            setContent("DisplayMyNft(on sale)")
        }      
    }
    useEffect( () => {
      if(window.ethereum == "undefined") {
        console.log("found no metamark ")
        return
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      provider.send("eth_requestAccounts", [])
      .then((accounts)=>{
        if(accounts.length>0) setCurrentAccount(accounts[0])
      }).catch((e)=>console.log(e))
      
      if(!currentAccount){
        console.log("please log in your account first !!!")
        return
      } 
      provider.getSigner()
      .then((result)=>{
        if(result) setSigner(result)
      }).catch((e)=>console.log(e))

      const market = new ethers.Contract(MarketAddress, abi_market, provider)
      provider.getCode(MarketAddress).then((result:string)=>{
      if(result === '0x') {
        console.log("found no codes on the contract:",MarketAddress)
        return -1
      }
      market.fetchActiveItems().then((result)=>{
        setItems(result)
        console.log("items length:", result.length)
      }).catch((e)=>console.log(e))
      })
      if(!items) return
        console.log("token_info7:", items)
        console.log("currentAccount:", currentAccount)
      
      },[currentAccount, items?.length])
      return (
        
      <Grid templateColumns='repeat(3, 1fr)' gap={0} w='50%'>
        <Box>
          <Button type="button" onClick={handle}>{content}</Button>
        </Box>
        {show
        ?
        (items.length == 0)
        ?<Box>no item</Box>
        : items.map((item:any) => (
                <GridItem key={item.id} >
                {
                ((item.seller.toLowerCase() == currentAccount && item.buyer == ethers.ZeroAddress) || (item.buyer.toLowerCase() == currentAccount))
                ?<CardERC721 tokenId={item.tokenId} ></CardERC721>
                :<Text></Text>
                }
              </GridItem>
              ))
        :<Box></Box>}
      </Grid>
   
      )

}