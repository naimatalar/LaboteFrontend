import { ErrorMessage, Form, Formik } from 'formik';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
import fileBaseString from './convertFileBase64';
import { SelectTYOptionGenerator, SelectTYSelectedValue } from './selectOptionGenerator';
import Switch from "react-switch";

// import SelectTYOptionGenerator from './SelectTYOptionGenerator';
export default function TrendyolFormCreator({ data, submit = (marketPlace, data) => { }, categoryId, clsSubmit, isOk, initialData, baseProductData, result, varyantChange, varyantList= [] }) {

    const [initialValue, setInitialValue] = useState({ categoryId: categoryId, currencyType: "TRY", productMainId: false, title: "", listPrice: 0, salePrice: 0, quantity: 0, dimensionalWeight: 0, vatRate: "", description: "" })
    const [loading, setLoading] = useState(false)
    const [submitFormLoading, setSubmitFormLoading] = useState(false)
    const [hasBarcode, setHasBarcode] = useState(true)
    const [brandList, setBrandList] = useState([])
    const [loadingBrands, setLoadingBrands] = useState(true)
    const [cargoCompanyList, setCargoCompanyList] = useState([])
    const [images, setImages] = useState([])
    const [isVariant, setIsVariant] = useState(false)
    const [variants, setVariants] = useState([])
    const [editLoading, setEditLoading] = useState(false)
    const [refreshPage, setRefreshPage] = useState(new Date())
    const [selectOptions, setSelectOptions] = useState(null)
    const [attributeList, setAttributeList] = useState([])
    const [errorValidation, setErrorValidation] = useState([])
    const [errorValidationBaseAttr, setErorValidationBaseAttr] = useState([])


    useEffect(() => {
        if (initialData?.data) {

            if (initialData.data[0].productMainId) {
                setIsVariant(true)
            }
            setVariants(initialData.data)
        }
        start()

    }, [data, isOk, result,varyantChange])

    const inputFileRef = React.useRef();
    const start = async () => {
        if (varyantList.length > 1) {
            setIsVariant(true)

        }
        var response = await GetWithToken("Product/GetTrendyolCargoCompany")
        setCargoCompanyList(response.data.data.map((item, key) => { return { value: item.id, label: item.name } }))
        var initdata = initialValue;
        initdata.description = baseProductData?.description;
        initdata.title = baseProductData?.productName;
        initdata.dimensionalWeight = baseProductData?.dimensionalWeight;
        initdata.salePrice = baseProductData?.salePrice;
        initdata.listPrice = baseProductData?.listPrice;
        initdata.quantity = baseProductData?.quantity;
        initdata.vatRate = baseProductData?.kdv;
       initdata.stockCode = baseProductData?.sku;
       initdata.barcode = baseProductData?.barcode;

        setInitialValue(initdata)
        setRefreshPage(new Date())


    }
    const onFileChangeCapture = async (e, setVelue) => {

        var imgs = images;
        var isExist = images.find(x => { return x?.image.name == e.target.files[0].name })

        var base64 = await fileBaseString(e.target.files[0])
        if (!isExist) {

            imgs.push({ image: e.target.files[0], base64: base64 });
            setImages(imgs)

        };
        var i = 1;
        for (const item of images) {


            i++
        }

        setVelue("images", imgs)
        setRefreshPage(new Date());
        document.getElementById("file-upload").value = null;

    };
    const setFieldAttributeValueFunc = (x, item) => {
        x("", item)
    }

    const selectOnValueChange = (x, item) => {

        console.log(attributeList)
        var attr = attributeList.filter(y => { return y.attributeId != item.attribute.id })

        if (x?.value) {
            attr.push({ attributeId: item.attribute.id, attributeValueId: x?.value })
        }
        setRefreshPage(new Date() + "8ffa")
        setAttributeList(attr)
        setRefreshPage(new Date())



    }

    const inputTextOnValueChange = (x, item) => {

        var attr = attributeList.filter(y => { return y.attributeId != item.attribute.id })

        if (x) {
            attr.push({ attributeId: item.attribute.id, customAttributeValue: x })
        }
        setAttributeList(attr)
        setRefreshPage(new Date())


    }
    const pushVariant = (data) => {

        var variantdata = variants;
        var isExist = variants.find(x => { return x == data })
        var autoSelectVariant = varyantList.filter(x => { return x.sku != data.merchantSku })[0]
        if (autoSelectVariant) {
            varyantChange(autoSelectVariant.sku)
        }
        if (!isExist) {
            variantdata.push(data)

        }
    }
    const submitForm = () => {
        setSubmitFormLoading(true);
        setTimeout(() => {
            setSubmitFormLoading(false);
        }, 600);
        submit(1, variants)


    }
    const validControl = () => {
        var attr = data.categoryAttributes?.filter(x => { return x.required == true })
        var valid = []
        for (const item of attr) {

            var attrId = attributeList.find(x => { return x.attributeId == item.attribute.id })

            if (!attrId) {
                valid.push(item.attribute.name)
            }
        }

        setErrorValidation(valid)
        setRefreshPage(new Date())
        return valid
    }
    const brandListFill = async (val) => {
        setLoadingBrands(true)

        setTimeout(async () => {

            var response = await GetWithToken("Product/GetTrendyolBrandsByName/" + val)
            setBrandList(response.data.data.map((item, key) => { return { value: item.id, label: item.name } }))

            setLoadingBrands(false)

        }, 500);
    }



    const setImageToFormik = (setValueFiels) => {

        var i = 1;
        for (const item of images) {
            // setValueFiels("Images" + i, item)

            i++
        }
        setValueFiels("images", images)
        // setRefreshPage(new Date())
    }
    const formReset = (resetForm) => {
        resetForm();
    };

    const deleteImage = async (e, setValue) => {
        confirmAlert({
            title: "Kayıt Silinecek",
            message: "Kayıt silinecek onaylıyor musunuz",
            buttons: [
                {
                    className: "alert-danger",

                    label: "Sil",
                    onClick: () => {

                        var imgs = images.filter(x => { return x.image.name != e.image.name });
                        var i = 1;

                        setValue("images", imgs)

                        if (imgs) {
                            setImages(imgs)
                        } else {
                            setImages([])
                        }


                        document.getElementById("file-upload").value = null;

                        setRefreshPage(new Date())
                        return imgs
                    }
                },
                {
                    label: "Vazgeç"
                }
            ]
        })

    }

    const deleteVariant = async (variant) => {
        confirmAlert({
            title: "Kayıt Silinecek",
            message: "Kayıt silinecek onaylıyor musunuz",
            buttons: [
                {
                    className: "alert-danger",

                    label: "Sil",
                    onClick: () => {
                        var vrs = variants.filter(x => { return x != variant });
                        setVariants(vrs)
                        clsSubmit(1)
                        setRefreshPage(new Date())
                    }
                },
                {
                    label: "Vazgeç"
                }
            ]
        })

    }

    return (

        <Formik
            initialValues={initialValue}
            validate={values => {
                const errors = {};
                let listErrors = []

                validControl();

                if (!values["title"]) {
                    errors["title"] = "Ürün Adı Zorunlu"
                    listErrors.push("Ürün Adı")
                }

                if (!values["barcode"]) {
                    errors["barcode"] = "Barkod Zorunlu"
                    listErrors.push("Barkod")
                }
                if (!values["brandId"]) {
                    errors["brandId"] = "Marka Zorunlu"
                    listErrors.push("Marka")
                }
                // if (!values["quantity"]) {
                //     errors["quantity"] = "Stok Adeti zorunlu"
                //     listErrors.push("Stok adeti")
                // }
                if (!values["stockCode"]) {
                    errors["stockCode"] = "Stok Kodu Zorunlu"
                    listErrors.push("Stok Kodu")
                }
                if (!values["dimensionalWeight"]) {
                    errors["dimensionalWeight"] = "Desi zorunlu"
                    listErrors.push("Desi")

                }
                
                // if (!values["salePrice"]) {
                //     errors["salePrice"] = "Satış Fiyatı Zorunlu"
                //     listErrors.push("Satış Fiyatı")

                // }
                // if (!values["listPrice"]) {
                //     errors["listPrice"] = "Liste Fiyatı Zorunlu"
                //     listErrors.push("Liste Fiyatı")

                // }
                // if (!values["vatRate"]) {
                //     errors["vatRate"] = "KDV Zorunlu"
                //     listErrors.push("KDV")

                // }
                if (!values["cargoCompanyId"]) {
                    errors["cargoCompanyId"] = "Kargo Gönderim Şirketi Zorunlu"
                    listErrors.push("Kargo Gönderim Şirketi")

                }
                if (!values["description"]) {
                    errors["description"] = "Ürün Açıklaması Zorunlu"
                    listErrors.push("Ürün Açıklaması")

                }

                setErorValidationBaseAttr(listErrors)
                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {

                setTimeout(async () => {

                    submit(1, "[" + JSON.stringify(values) + "]")
                    setSubmitting(false);
                }, 400);
            }}
        >
            {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values, isValid, setValues, resetForm, errors }) => (
                <Form className='row col-12 mp-form-content pl-5 pr-5 pt-5 pb-5' style={{ position: "relative" }} >

                    {
                        loading && <Image height={50} width={50} src={require("../layout/assets/images/loading.gif")}></Image>
                    }



                    {result && result.responseData?.isApiError == false &&


                        <div className='response  col-12 mb-3'>

                            {
                                result.responseData?.response?.items?.map((item, key) => {
                                    return <div key={key} className={"row justify-content-center " + (item.status == "FAILED" && "response-ty-error-content " || "response-ty-success-content")}>
                                        <div className='col-4'>
                                            <p><b>Ürün : </b>{item.requestItem.product.title}</p>
                                            <p><b>Barkod : </b>{item.requestItem.product.barcode}</p>
                                        </div>
                                        {
                                            item.status == "FAILED" && <><div className='col-4 row justify-content-right'>
                                                <i className="fas fa-exclamation-triangle" style={{
                                                    fontSize: "35px",
                                                    color: "red"
                                                }}></i> <span style={{ color: "red", fontWeight: "bold" }}>Hatalı Ürün Gönderimi</span>
                                            </div>

                                                <ul className='error-item-li row col-8 justify-content-start'>
                                                    {item.failureReasons.map((jitem, jkey) => {
                                                        return <li className='col-12 text-center mb-1' style={{ listStyle: "none" }} key={jkey}><i style={{ color: "red" }} className='fas fa-exclamation-triangle'></i> &nbsp; {jitem}</li>
                                                    })}
                                                </ul></>
                                        }
                                        {
                                            item.status != "FAILED" && <><div className='col-4 row justify-content-right'>
                                                <i className="fas fa-check-circle " style={{
                                                    fontSize: "35px",
                                                    color: "green",
                                                    lineHeight: "31px",
                                                    marginLeft: "7px"
                                                }}></i> <span style={{ color: "green", fontWeight: "bold" }}>Ürün Başarılı Bir Şekilde Gönderildi</span>
                                            </div>

                                                <ul className='error-item-li row col-8 justify-content-start'>
                                                    {item.failureReasons.map((jitem, jkey) => {
                                                        return <li key={jkey}>{jitem}</li>
                                                    })}
                                                </ul></>
                                        }

                                    </div>
                                })
                            }

                        </div>

                    }
                    {result?.responseData && result?.responseData.isApiError &&
                        <div className='response-ty-error-content row col-12 justify-content-center pb-3 mb-3' >
                            <div className='row col-12 text-center mb-2'>
                                <p className='col-12'><span style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>Bu ürün Trendyola kaydedilmedi </span><br /></p>

                            </div>
                            <div className='row col-12'>
                                <div className='col-6'>
                                    <b>Şu sebeplerden olabilir;</b>
                                    <ul >
                                        <li>Trendyol Api bilgilerinin hatalı olması</li>
                                        <li>İnternet bağlantısının yarıda kesilmesi</li>
                                        <li>İşlem tamamlanmadan sayfadan ayrılma</li>
                                        <li>Girilen bilgilerin hatalı olması</li>

                                    </ul>
                                    <i>Not: Bu üründe bu hatayı sürekli alıyorsanız bizimle iletişimne geçiniz.</i>
                                </div>
                                <div className='col-6'>
                                    <i className="fas fa-exclamation-triangle" style={{
                                        fontSize: "35px",
                                        color: "red"
                                    }}></i> <span style={{ color: "red", fontWeight: "bold" }}>Hatalı Ürün Gönderimi</span>
                                </div>
                            </div>

                        </div>
                    }
                    {/* {JSON.stringify(result)} */}
                    <div className='col-12 row'>

                        {/* <div className='ml-2 mr-3' style={{
                            fontSize: 21,
                            marginTop: "-2px"
                        }}> Bu Ürün Varyantlı</div>
                        <div>
                            <Switch onChange={(x) => { clsSubmit(1); setIsVariant(x); setVariants([]); setFieldValue("productMainId", x) }} checked={isVariant} />

                        </div> */}

                        <div className='col-12 p-0 m-0 mb-2 row'>
                            {/* <div className='ml-2 mr-3' style={{
                                        fontSize: 21,
                                        marginTop: "-2px"
                                    }}> Bu Ürün Varyantlı</div>
                                    <div>
                                        <Switch onChange={(x) => { clsSubmit(2); setIsVariant(x); setVariants([]) }} checked={isVariant} />

                                    </div> */}

                            {/* <input defaultChecked={isVariant} style={{ height: 15, width: 15 }} type={"checkbox"} onChange={x => { clsSubmit(2); setIsVariant(x.target.checked); setVariants([]) }}></input>  */}
                            {
                                varyantList.length > 1 &&
                                <>
                                    <div className='row col-12 p-0'><b className='col-12' style={{ fontSize: 17 }}>Bü ürün {varyantList.length} varyant içeriyor</b><br></br>
                                        <i className='col-12 mb-2' style={{ fontSize: 15 }}>Varyantı seçtikten sonra ürün ek özelliklerini girip sanalpazara kaydetme işi yapabilirsiniz</i></div>
                                    {varyantList.map((item, key) => {
                                    
                                        var existVariant = variants.find(x => x.stockCode == item.sku)
                                        if (existVariant) {
                                            return false 
                                        }
                                        return <div key={key} className={(initialValue?.stockCode == item.sku && "clck-active-variant") + " vrlistbutton"}>
                                            <button type='button' onClick={() => { varyantChange(item.sku); setRefreshPage(new Date()) }}>(varyant {key + 1}) <b>{item.sku}</b></button>
                                            {initialValue?.stockCode == item.sku && <i className='fas fa-caret-up caretup-fa'></i>}
                                        </div>
                                    })}
                                </>
                            }

                        </div>

                        {/* <label style={{ fontSize: 18 }}><input defaultChecked={isVariant}  style={{ height: 15, width: 15 }} type={"checkbox"} onChange={x => { clsSubmit(1); setIsVariant(x.target.checked); setVariants([]);setFieldValue("productMainId",x.target.checked) }}></input> Bu Ürün Varyantlı</label> */}


                        {!isVariant &&
                            <>
                                <div className='col-12 row ml-1'>
                                    <button className='btn btn-info btn-sm' type='button' onClick={() => inputFileRef?.current?.click()}><i className='fa fa-image'></i> Resim Yükle</button>
                                    <input
                                        style={{ display: "none" }}
                                        type="file"
                                        ref={inputFileRef}
                                        id="file-upload"
                                        onChange={(x) => {
                                            onFileChangeCapture(x, setFieldValue);
                                            setImageToFormik(setFieldValue)
                                        }}
                                        accept='.jpg,.png'
                                    />

                                </div>

                                {
                                    images.length > 0 &&
                                    <div className='col-12  mt-2 mb-3' style={{
                                        background: "#d1d1d1",
                                        padding: "16px 7px 9px 12px"
                                    }}>
                                        <div className='row'>
                                            {images.map((item, key) => {
                                                return (<div key={key} style={{ position: "relative" }}>
                                                    <span className='trash-image-button' onClick={() => {
                                                        deleteImage(item, setFieldValue);

                                                    }}><i className='fa fa-trash'></i></span>
                                                    <img src={URL?.createObjectURL(item?.image)} style={{ width: 100, marginRight: 30 }}></img>
                                                </div>)
                                            })}

                                        </div>

                                    </div>
                                }
                            </>
                        }
                        <div className='row col-12 mt-4'>
                            {/* <div className='col-6  mb-3 ' >
                                <div className='input-label'>
                                    <label>Ürün Adı </label>
                                    <b style={{ color: "red" }}>&nbsp;*</b>
                                    <ErrorMessage name="title">{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                </div>


                                <input type="text" className='form-control' value={values.title} onBlur={handleBlur} onChange={(x) => { setFieldValue("title", x.target.value || null) }} name="title" ></input>
                            </div> */}

                            <div className='col-6  mb-3 ' >
                                <div className='input-label'>
                                    <label>Marka   </label>
                                    <><b style={{ color: "red" }}>&nbsp; * </b> <i>En az 3 harf giriniz</i></>
                                    <ErrorMessage name={"brandId"}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                </div>
                                <Select
                                    isClearable
                                    options={brandList}
                                    value={brandList.find(x => { return x.value == values?.brandId }) || null}
                                    placeholder="Marka Seçiniz"
                                    className="menuss"
                                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                    onBlur={handleBlur} onInputChange={(x) => { (x.length > 2 && brandListFill(x)) }}
                                    onChange={(x) => { setFieldValue("brandId", x?.value || null) }} name={"brandId"} noOptionsMessage={(x) => loadingBrands && "Yükleniyor..." || <span style={{ color: "red" }}>Marka Bulunamadı</span> || (x.length < 2 && setLoadingBrands(false))}></Select>
                            </div>

                            <div className='col-6  mb-3 ' >

                                <div className='input-label'>
                                    <label>Stok Kodu</label>
                                    <b style={{ color: "red" }}>&nbsp; *</b>
                                    <ErrorMessage name="stockCode">{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                </div>

                                <input type="text" value={values["stockCode"]} className='form-control' onBlur={handleBlur} onChange={(x) => { setFieldValue("stockCode", x.target.value || null) }} name="stockCode" ></input>
                            </div>


                            <div className='col-6  mb-3 mt-3' >
                                <div className='input-label'>
                                    <label>Gönderim Kargo Şirketi</label>  <b style={{ color: "red" }}>&nbsp; *</b>
                                    <ErrorMessage name="cargoCompanyId">{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                </div>
                                <Select
                                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                    isClearable
                                    options={cargoCompanyList}
                                    value={cargoCompanyList.find(x => { return x.value == values["cargoCompanyId"] }) || null}

                                    onBlur={handleBlur} onChange={(x) => { setFieldValue("cargoCompanyId", x?.value || null) }} name="cargoCompanyId" ></Select>
                            </div>

                            <div className='col-6  mb-3 mt-3' >
                                <div className='input-label'>
                                    <label>Barkod </label>
                                    <b style={{ color: "red" }}>&nbsp; *</b>
                                    <ErrorMessage name="barcode">{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                </div>
                                <div className='col-12 row'>
                                    <div className='col-7 p-0'>
                                        <input value={values.barcode} disabled={!hasBarcode} type="text" onBlur={handleBlur} onChange={handleChange} name={"barcode"} className='form-control'></input>
                                    </div>
                                    <div className='col-5 row p-0'>
                                        <div className='col ml-2 mt-2'>
                                            <label><input type="checkbox" onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFieldValue("barcode", "TENT-" + Math.floor((Math.random() * 99999999999)) + "N" + Math.floor((Math.random() * 300)))
                                                    setHasBarcode(false)
                                                } else {
                                                    setFieldValue("barcode", "")
                                                    setHasBarcode(true)
                                                }
                                            }} value={values["barcode"]} name={"barcode"} ></input> Barkod yok</label>
                                        </div>
                                    </div>
                                </div>
                            </div>




                            {
                                data.categoryAttributes?.map((item, key) => {

                                    return (
                                        <>

                                            {
                                                item.allowCustom == true && <>
                                                    <div className='col-6  mb-3 mt-3' key={key}>
                                                        <div className='input-label'>
                                                            <label>{item.attribute.name}  </label>
                                                            {item?.required && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                            {item?.attribute.id &&

                                                                <ErrorMessage name={item?.attribute.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                            }
                                                        </div>
                                                        <input type={"text"} className='form-control'
                                                            onBlur={handleBlur} onChange={(x) => {
                                                                inputTextOnValueChange(x.target.value, item)
                                                                setFieldValue("attributes", attributeList)
                                                                setRefreshPage(new Date() + "rf_dat")
                                                            }
                                                            } value={values[item?.attribute.id]}></input>
                                                    </div>
                                                </>
                                            }

                                            {
                                                item.allowCustom == false && item.attributeValues.length > 0 && <>
                                                    <div className='col-6  mb-3 mt-3' key={key}>
                                                        <div className='input-label'>
                                                            <label>{item.attribute.name} {item.attribute.id} </label>
                                                            {item?.required && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                            {item?.attribute.id &&
                                                                <ErrorMessage name={item?.attribute.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                            }
                                                        </div>
                                                        <Select
                                                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                            isClearable
                                                            options={SelectTYOptionGenerator(item.attributeValues, selectOptions)}
                                                            value={SelectTYSelectedValue(item.attributeValues, item.attribute.id)}
                                                            onInputChange={(val) => {
                                                                setSelectOptions(val)
                                                            }}
                                                            onBlur={(x) => {
                                                                handleBlur(x);
                                                                setFieldValue("attributes", attributeList)
                                                            }} onChange={(x) => {

                                                                selectOnValueChange(x, item)
                                                                setFieldValue("attributes", attributeList)
                                                                setRefreshPage(new Date() + "rf_dat")
                                                            }} ></Select>

                                                    </div>
                                                </>
                                            }


                                        </>

                                    )

                                })
                            }
                            <div className='col-12'>


                            </div>
                        </div>
                        <div className='col-12 mt-2'>
                            {
                                isVariant && <div className='row justify-content-center variant-content'>
                                    <div className='col-12 row  variant-content'>
                                        <div className='col-12 mb-2'>
                                            <b>Varyant Özellikleri</b>
                                        </div>



                                    </div>

                                    {isVariant &&
                                        <>
                                            <div className='col-12 row mb-3 ml-2'>
                                                <button className='btn btn-info btn-sm' type='button' onClick={() => inputFileRef?.current?.click()}><i className='fa fa-image'></i> Resim Yükle</button>
                                                <input
                                                    style={{ display: "none" }}
                                                    type="file"
                                                    ref={inputFileRef}
                                                    id="file-upload"
                                                    onChange={(x) => {
                                                        onFileChangeCapture(x, setFieldValue);
                                                        setImageToFormik(setFieldValue)
                                                    }}
                                                    accept='.jpg,.png'
                                                />

                                            </div>

                                            {
                                                images.length > 0 &&
                                                <div className='row col-12 pt-0'>


                                                    <div className='col-12  mt-0 mb-3' style={{
                                                        border: "2px dotted green",
                                                        padding: "16px 7px 9px 12px"
                                                    }}>
                                                        <div className='row col-12'>
                                                            {images.map((item, key) => {


                                                                return (<div key={key} style={{ position: "relative" }}>
                                                                    <span className='trash-image-button' onClick={() => {
                                                                        var totalImages = deleteImage(item, setFieldValue)

                                                                    }}><i className='fa fa-trash'></i></span>
                                                                    <img src={URL?.createObjectURL(item?.image)} style={{ width: 100, marginRight: 30 }}></img>
                                                                </div>)
                                                            })}

                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    }

                                </div>

                            }
                        </div>
                    </div>
                    {
                        editLoading &&
                        <div className='form-loading-light' style={{ position: "fixed", zIndex: 999999, right: 0, left: 0, width: "100%", height: "100%", margin: "0 auto", top: 0, background: "rgb(0 0 0 / 66%) " }}>
                            <div style={{ width: 90, height: 90, margin: "20% auto" }}>
                                <Image height={90} width={90} src={require("../layout/assets/images/loading.gif")}></Image>
                            </div>
                        </div>
                    }

                    <div className='row col-12 mt-3'>



                        <div style={{ width: 120 }}>

                            {
                                ((isVariant) || (!isVariant && variants.length == 0)) &&

                                <button className='btn btn-info mt-4' type='button' onClick={(x) => {
                                    console.log("clk", attributeList)
                                    var validcontrol = false;
                                    data.categoryAttributes?.map((item, key) => {
                                        // document.getElementsByTagName("input")[item?.id]?.value = null
                                        if (values[item.id]) {
                                            validcontrol = true
                                        }
                                    })


                                    if (isValid && images.length > 0 && errorValidationBaseAttr.length == 0 && errorValidation.length == 0) {

                                        var isExist = variants.find(x => { return x == values })

                                        if (!isExist) {

                                            pushVariant(values);
                                            setImages([])
                                            // resetForm()
                                            // setInitialValue({})   
                                            formReset(resetForm)
                                            setRefreshPage(new Date())
                                            setTimeout(() => {
                                                for (var i of document.getElementsByTagName("input")) {
                                                    i.value = null;
                                                }
                                                for (var i of document.getElementsByTagName("textarea")) {
                                                    i.value = null;
                                                }
                                            }, 100);
                                            setEditLoading(true);
                                            clsSubmit(1)
                                            start();
                                            setTimeout(() => {
                                                submitForm()
                                                setEditLoading(false)
                                            }, 500);
                                        }
                                    } else {
                                        if (errorValidation.length > 0 || errorValidationBaseAttr.length > 0) {
                                            let vv = []
                                            var datas = errors;
                                            for (const item of data.categoryAttributes) {
                                                var vald = errors[item.attribute.id]
                                                if (vald) {
                                                    vv.push(<b className='error-items mt-3'>{item.attribute.name}</b>)
                                                }
                                            }

                                            confirmAlert({
                                                title: "İşlem Başarısız",
                                                message: <div className='row'><p>Lütfen zorunlu alanları doldurunuz.</p> <div className='col-12'>
                                                    {errorValidation.map((item, key) => { return <><span key={key} className='mb-2 error-items-val'>{item}</span><br /></> })}
                                                    {errorValidationBaseAttr.map((item, key) => { return <><span key={key} className='mb-2 error-items-val'>{item}</span><br /></> })}</div></div>,
                                                buttons: [
                                                    {
                                                        label: 'Tamam',
                                                        onClick: () => { }
                                                    }
                                                ]
                                            })



                                        } else if (!validcontrol && isVariant) {

                                            AlertFunction("İşlem Başarısız", " En az 1 adet varyant özelliği girilmelidir.")
                                        }
                                    }
                                    if (images.length == 0) {
                                        AlertFunction("İşlem Başarısız", " En az 1 adet resim yüklenmelidir.")

                                    }

                                }}><i className='fa fa-plus'></i> Ekle  </button>}
                        </div>

                        {variants.length > 0 &&
                            <div className='row col-12 mt-3 control-variant'>
                                {/* <-- Varyant Listesi Content---> */}
                                <div className='col-12 '>
                                    {
                                        isVariant && variants > 0 && <b>Varyant Listesi</b>
                                    }
                                    {
                                        variants.length > 0 && !isVariant && <b>Ürün Bilgisi</b>
                                    }
                                    <div className='row col-12 justify-content-center mt-1'>

                                        {variants?.map((item, key) => {

                                            var { status } = result?.responseData?.response?.items?.find(x => x.requestItem?.product.barcode == item.barcode) || { status: "SUCCESS" }

                                            return <div key={key} className='row col-12 justify-content-center vr-list-cnt mb-2'><div className='row  justify-content-center' style={{
                                                background: "white",
                                                padding: "5px",
                                            }}>
                                                <div><b style={{ fontSize: 14 }}>{key + 1}&nbsp;-&nbsp;</b></div>
                                                <div><b>Ürün Adı</b> : {item["title"] || "(Boş)"} </div>
                                                {
                                                    data.categoryAttributes?.map((jitem, jkey) => {
                                                        if (jitem.varianter) {
                                                            return (
                                                                <div key={jkey} className='ml-2 mb-1 row'>
                                                                    <div className='ml-3'>    <b>{jitem.attribute.name} </b> : {item[jitem.attribute.id] || "(Boş)"} </div>
                                                                </div>
                                                            )
                                                        }

                                                    })
                                                }
                                                {status != "SUCCESS" && <div className='ml-2 mr-2'><b style={{ color: "red" }}>Bu Ürün Hatalı Gönderilemez</b></div>}
                                                {status == "SUCCESS" && <div className='ml-4 mr-2 variant-detail-button' onClick={() => {
                                                    setEditLoading(true)
                                                    setImages([])
                                                    setTimeout(() => {
                                                        setEditLoading(false)
                                                    }, 1000);

                                                    var img = [];
                                                    for (let index = 1; index < 6; index++) {
                                                        if (item["Image" + index]) {
                                                            var imgCount = img.filter(x => { return x == item["Image" + index] })
                                                            if (imgCount == 0) {
                                                                img.push(item["Image" + index])
                                                            }
                                                        }

                                                    }
                                                    setImages(img)
                                                    setValues(item);

                                                    setRefreshPage(new Date())
                                                    setValues(item);

                                                }}><i className='fa fa-copy '></i> Kopyala</div>}


                                                <div className='ml-1 mr-2 variant-del-button' onClick={() => { deleteVariant(item); }}><i className='fa fa-trash'></i> Sil</div>

                                            </div>
                                            </div>
                                        })}
                                    </div>

                                </div>


                                <div className='row col-12'>


                                    {variants.length > 0 &&
                                        <b className='d-block mt-4 complete-form-warn'><i className='fa fa-check-circle'></i> Kayıt İçin Uygun</b>}
                                    {isOk && <div className='row col-2'>


                                        <button className=' btn btn-danger ml-2 mt-4'
                                            onClick={() => {
                                                setImages([])
                                                setVariants([])
                                                clsSubmit(2)


                                                setErorValidationBaseAttr([])
                                                setErrorValidation([])

                                                setTimeout(() => {
                                                    for (var i of document.getElementsByTagName("input")) {
                                                        i.value = null;
                                                    }
                                                    for (var i of document.getElementsByTagName("textarea")) {
                                                        i.value = null;
                                                    }
                                                }, 100);
                                                setRefreshPage(new Date())
                                            }}
                                        ><i className='fa fa-trash'></i><span>Temizle</span> </button>

                                    </div>}


                                </div>
                            </div>}

                    </div>

                </Form>
            )
            }
        </Formik >

    )

}