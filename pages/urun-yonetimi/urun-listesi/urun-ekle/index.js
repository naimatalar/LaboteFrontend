import React, { useEffect, useState } from 'react';
import Layout from '../../../../layout/layout';
import PageHeader from '../../../../layout/pageheader';
import Select from 'react-select'
import { GetWithToken, PostWithToken } from '../../../api/crud';
import HepsiburadaFormCreator from '../../../../components/hepsiburadaFormCreator';
import Image from 'next/image';
import AlertFunction from '../../../../components/alertfunction';
import TrendyolFormCreator from '../../../../components/trendyolFormCreator';
import { getMerchantFromStrorage } from '../../../../components/localStorage';
import { Modal } from 'reactstrap';
import { useRouter } from 'next/router';
import { PriceSplitter } from '../../../../components/pricesptitter';
import { confirmAlert } from 'react-confirm-alert';
var isBrowser = typeof (window) != undefined;
export default function Index(props) {
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("none")
    const [selectedMpCategory, setSelectedMpCategory] = useState({})
    const [categoryList, setCategoryList] = useState([])
    const [attributes, setAttributes] = useState({})
    const [marketPlaces, setMarketPlaces] = useState([])
    const [selectedMarketPlace, setSelectedMarketPlace] = useState(0)
    const [masterData, setMasterData] = useState([])
    const [refreshPage, setRefreshPage] = useState(new Date())
    const [productId, setProductId] = useState()
    const [productStatus, setProductStatus] = useState([])
    const [productList, setProductList] = useState([])

    const [product, setProduct] = useState({
        productName: "",
        antegraCategoryId: "",
        salePrice: null,
        kdv: "",
        listPrice: null,
        id: null,
        quantity: null,
        kdv: "",
        dimensionalWeight: null,
        description: "",
        barcode:""
    })

    const router = useRouter()



    useEffect(() => {

        start();
    }, [getMerchantFromStrorage().value])

    const submit = async (marketPlace, data) => {


        var dd = masterData.filter(x => x.marketPlaceKind != marketPlace);
        dd.push({ marketPlaceKind: marketPlace, data: data, categoryId: selectedCategory.value, merchantId: getMerchantFromStrorage().value })
        setMasterData(dd);

    }
    const clsSubmit = async (marketPlace) => {
        var dd = masterData.filter(x => x.marketPlaceKind != marketPlace);
        setMasterData(dd);
    }
    const changeProduct = async (sku) => {
      
       var dd= productList.find(x=>{return x.sku==sku})
        setProduct(dd)
    }
    const start = async () => {
        if (isBrowser) {
            const urlParams = new URLSearchParams(window.location.search);
            const variantGroupId = urlParams.get('variantGroupId');


            var dt = await GetWithToken("ProductPageData/GetPageData/" + getMerchantFromStrorage().value + "/" + variantGroupId).then(x => { return x.data }).catch((e) => { AlertFunction("", e); return false })
   
            setLoading(false)
            debugger;
            if (!dt.data?.product.length>0 || !dt.data?.marketPlaces.length>0) {
                confirmAlert({
                    title: "Ürün Bilgisi",
                    message: "Ürün bilgisi bulunamadı. ",
                    buttons: [
                        {
                            label: "Tamam",
                            onClick: () => { router.push({ pathname: '/urun-yonetimi/urun-listesi' }) }
                        }
                    ]
                })
                return false;
            }
            setMarketPlaces(dt.data?.marketPlaces)
            setProductList(dt.data?.product)
            setProduct(dt.data?.product[0])
            setProductId(dt.data?.product[0]?.id)
            getAttributes({ value: dt.data.product[0]?.antegraCategoryId })


            setTimeout(() => {

                setSelectedMarketPlace(dt.data.marketPlaces[0]?.marketPlaceKind)
 
            }, 1000);
            setRefreshPage(new Date())
        }
    }
    const produtPostToMarketPlaces = async () => {

        var d = await PostWithToken("Product/ProductPostToMarketPlaces/", { productId: productId, listData: masterData }).then((x) => { return x.data })

        setProductStatus(d.data)

    }
    const getAttributes = async (val) => {
        setLoading(true); 
      
        var d = await GetWithToken("Product/getCategoryAttributes/" + val.value).then((x) => { return x.data })

        console.log(d)
        var mpCategoriId = await GetWithToken("CategoryManager/GetMpCategoriesById/" + val.value).then((x) => { return x.data })

        setSelectedMpCategory(mpCategoriId.data)
        setSelectedCategory(val)
        setAttributes(d.data)
        setLoading(false)


        // setTimeout(() => { 
        //     debugger
        //     setSelectedMarketPlace(marketPlaces[0]?.marketPlaceKind)
        //     setRefreshPage(new Date()+"gdf")
        // }, 1000);
    }



    return (

        <Layout permissionControl={false}>
            <PageHeader title="Ürün Ekle" map={[
                { url: "", name: "Ürün Yönetimi" },
                { url: "/urun-yonetimi/urun-listesi", name: "Ürün Listesi" },
                { url: "", name: "Ürün Ekle" }
            ]}>
            </PageHeader>
            <div className='content'>


                <div className='row justify-content-center' >
                    <div className='row justify-content-center col-10 product-add-info'>

                        <div className='col-12 row justify-content-center'>
                            <div className='row col-12 justify-content-center mb-3'>
                                <div className='col-12 text-center'>
                                    <b style={{ fontSize: 20 }}>Ürün Ana Özllikleri</b>
                                </div>

                                <i style={{ fontSize: 16 }}>Her sanal pazar için ayrı ayrı özellik bilgileri girerek sanalpazarlara aktarma işlemi yapabilirsiniz. </i>
                            </div>
                            <div className='row col-12 product-attr1'>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Ürün Adı</b>
                                    <div>{product?.productName}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Kategori Adı</b>
                                    <div>{product?.antegraCategoryName}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Kdv</b>
                                    <div>{product?.kdv}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Stok Kodu</b>
                                    <div>{product?.sku}</div>
                                </div>
                            </div>
                            <div className='row col-12 product-attr2'>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Stok Adeti</b>
                                    <div>{product?.quantity}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Liste Fiyatı</b>
                                    <div>{PriceSplitter(product?.listPrice)}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Satış Fiyatı</b>
                                    <div>{PriceSplitter(product?.salePrice)}</div>
                                </div>
                                <div className='col-3 text-center'>
                                    <b style={{ textDecoration: "underline" }}>Desi</b>
                                    <div>{PriceSplitter(product?.dimensionalWeight)}</div>
                                </div>
                                {/* <div className='col-3 text-center'>
                                    <i style={{ color: "green", fontSize: 18 }} className='fa fa-check'></i>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row justify-content-center m-0'>


                    {
                        selectedCategory != "none" && <>
                            <div className='col-12 row' style={{ background: "#dbdbdb" }}>
                                <div className='col-12 row justify-content-end'>
                                    <button onClick={() => { produtPostToMarketPlaces() }} className='btn btn-success product-save-btn'><i className='fa fa-save'> </i> <b>Kaydet</b></button>
                                </div>
                                <ul className='marketPlaceList row col-12'>
                                    {marketPlaces?.map((item, key) => {

                                        return (<li key={key} className={selectedMarketPlace == item.marketPlaceKind && "active"} title={masterData.find(x => x.marketPlaceKind == item.marketPlaceKind) && "Kayıt için uygun." || "Kayıt için uygun değil"} onClick={() => { setSelectedMarketPlace(item.marketPlaceKind) }}>
                                            {masterData.find(x => x.marketPlaceKind == item.marketPlaceKind) && <b><i style={{ color: "green" }} className='fa fa-check-circle'></i>&nbsp;</b>}
                                            {!masterData.find(x => x.marketPlaceKind == item.marketPlaceKind) && <b><i style={{ color: "#cd7100" }} className='fa fa-exclamation-triangle'></i>&nbsp;</b>}
                                            {item.marketPlaceName}</li>)
                                    })}
                                </ul>
                            </div>
                            <div className='cnt col-12 p-0'>
                                {selectedMarketPlace == 2 && <div className={'col-12 row justify-content-center p-0 m-0 ' + (selectedMarketPlace != 2 && "hidden-panel-create")}>
                                    <div className='col-12 row ' style={{
                                        background: "rgb(219, 219, 219)",
                                        marginTop: -16,
                                        paddingRight: "0",
                                        marginRight: -20
                                    }}>
                                        {
                                            !loading && attributes?.hepsiburadaAttributeList && <div className='col-12 pl-3 row justify-content-center' >
                                                {/* <h2>Hepsiburada.com</h2> */}
                                                <HepsiburadaFormCreator varyantChange={changeProduct} varyantList={productList} clsSubmit={clsSubmit} initialData={masterData.find(x => x.marketPlaceKind == 2)} isOk={masterData.filter(x => x.marketPlaceKind == 2)?.length > 0} submit={submit} data={attributes?.hepsiburadaAttributeList?.data} categoryId={selectedCategory.value} baseProductData={product} result={productStatus.find(x => { return x.marketPlace == 2 })}></HepsiburadaFormCreator>
                                            </div>}
                                    </div>
                                </div>}

                                {selectedMarketPlace == 1 && <div className={'col-12 row justify-content-center p-0 m-0 ' + (selectedMarketPlace != 1 && "hidden-panel-create")}>
                                    <div className='col-12 row ' style={{
                                        background: "rgb(219, 219, 219)",
                                        marginTop: -16,
                                        marginRight: -20,
                                        paddingRight: "0"
                                    }}>
                                        {
                                            !loading && attributes?.trendyolAttributeList && <div className='col-12 pl-3 row justify-content-center' >
                                                {/* <h2>Hepsiburada.com</h2> */}
                                                <TrendyolFormCreator  varyantChange={changeProduct} varyantList={productList} clsSubmit={clsSubmit} initialData={masterData.find(x => x.marketPlaceKind == 1)} isOk={masterData.filter(x => x.marketPlaceKind == 1)?.length > 0} submit={submit} data={attributes?.trendyolAttributeList} categoryId={selectedMpCategory.trendyolCategoryId} baseProductData={product} result={productStatus.find(x => { return x.marketPlace == 1 })}></TrendyolFormCreator>
                                            </div>}
                                    </div>
                                </div>}
                            </div>
                        </>
                    }
                    {
                        loading && <div className='col-12 row justify-content-center' style={{ border: "1px solid blue" }}>

                            <div className='row col-12 justify-content-center mb-2 mt-3' style={{
                                background: "#cce3ff",
                                border: "1px solid #57a2ef",
                                padding: "13px 10px 13px 10px"
                            }}>
                                <Image height={50} width={50} src={require("../../../../layout/assets/images/loading.gif")}></Image>


                            </div>


                        </div>}
                </div>
            </div>
        </Layout>

    )

}