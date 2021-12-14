import { Table, Button, Image } from 'antd'
import { useMarketplace } from 'components/Admin/Module/contracts/NFT/useMarketplace'  
import { useMoralis } from 'react-moralis'
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider'
import React from 'react'
import { getEllipsisTxt } from 'helpers/formatters'
import { getExplorer } from 'helpers/networks'

export default function Marketplace(props) {
    const { Moralis, web3, isAuthenticated, authenticate } = useMoralis()
    const { chainId, walletAddress } = useMoralisDapp()
    const { allListings, unlist, isUnlisting, buy, loadingListings, hasEnoughTokensToBuy, isBuying } = useMarketplace(web3, props.address)

    const columns = [
        {
            title: 'Image',
            dataIndex: 'metadata',
            key: 'image',
            render: (record) => {
                let url = `https://ipfs.io/ipfs/${(record.image).split('ipfs://')[1]}`
                return (
                <Image
                src={url}
                width={"100px"}
                height={"100px"}
                />  
                )
            }      
        },
        {
            title: 'Description',
            dataIndex: 'metadata',
            key: 'desc',
            render: (record) => {
                return `${record.description}`
            }
        },
        {
            title: 'Seller',
            dataIndex: 'seller',
            key: 'seller',
            render: (record) => {
                return (
                    <a href={`${getExplorer(chainId)}address/${record}`} rel={"noreferrer"} target={"_blank"}>{getEllipsisTxt(record, 4)}</a>
                )
            } 
        },
        {
            title: 'Price',
            dataIndex: 'pricePerToken',
            key: 'pricePerToken',
            render: (record, item) => {
                return <div>
                    <p style={{textAlign: 'center'}}>{Moralis.Units.FromWei(record, item[0].decimals)} {item.tokenInfo[0].symbol}</p>
                </div>
            }
        },
        {
            title: 'Actions',
            dataIndex: 'listingId',
            key: 'Action',
            render: (record, item) => {
                if(!isAuthenticated) {
                    return (
                        <Button onClick={() => authenticate()}>
                            Connect Wallet
                        </Button>
                    )
                }
                if(props.isAdmin) {
                    return (
                        <div style={{display: 'flex', gap: '0.25em'}}>
                        <Button 
                        loading={isBuying}
                        onClick={async () =>{ 
                                if(!(await hasEnoughTokensToBuy(item.currency, item.pricePerToken, walletAddress))) {
                                    alert(`Insufficient Funds. Buy ${Moralis.Units.FromWei(item.pricePerToken, item.decimals)} ${item.tokenInfo[0].symbol}`)
                                    return
                                }
                                await buy(item.listingId, "1", item.currency, item.pricePerToken, walletAddress)
                            }}
                            >
                            Buy
                        </Button>
                        <Button 
                        loading={isUnlisting}
                        onClick={ async () => {
                            await unlist(record, "1", walletAddress)
                        }}>
                            Unlist
                        </Button>
                        </div>
                    )
                } else                 
                return (
                <>
                    <Button 
                    loading={isBuying}
                    onClick={ async () =>{ 
                        if(!(await hasEnoughTokensToBuy(item.currency, item.pricePerToken, walletAddress))) {
                            alert(`Insufficient Funds. Buy ${Moralis.Units.FromWei(item.pricePerToken, item.decimals)} ${item.tokenInfo[0].symbol}`)
                            return
                        }
                        await buy(item.listingId, "1", item.currency, item.pricePerToken,walletAddress)
                    }}
                    >
                    Buy
                    </Button>
                    {item.seller === walletAddress &&
                    <Button 
                    loading={isUnlisting}
                    onClick={ async () => {
                            await unlist(record, "1", walletAddress)
                    }}>
                    Unlist
                    </Button>
                    }
                </>
                )
            
            }
        }
    ]


    return (
        <div>
            <Table
            loading={loadingListings}
            dataSource={allListings} 
            columns={columns} 
            scroll={{x: true}}
            />
        </div>
    )
}
