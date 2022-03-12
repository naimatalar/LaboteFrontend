import { ErrorMessage, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
import Select from 'react-select'
import Image from 'next/image';
import { confirmAlert } from 'react-confirm-alert';
import fileBaseString from './convertFileBase64';
import { SelectHBOptionGenerator } from './selectOptionGenerator';
// import SelectHBOptionGenerator from './SelectHBOptionGenerator';
import Switch from "react-switch";
import { NavItem } from 'reactstrap';
var isBrowser = typeof (window) != undefined;
export default function HepsiburadaFormCreator({ data, submit = (marketPlace, data) => { }, categoryId, clsSubmit, isOk, initialData, baseProductData, result, varyantChange, varyantList = [] }) {
    const [initialValue, setInitialValue] = useState({ UrunAciklamasi: "", UrunAdi: "", merchantSku: "", tax_vat_rate: "", stock: "", price: 0, kg: "" })
    const [attributeValues, setAttributeValues] = useState({})
    const [loading, setLoading] = useState(true)
    const [refreshPage, setRefreshPage] = useState(new Date())
    const [isVariant, setIsVariant] = useState(false)
    const [variants, setVariants] = useState([])
    const [images, setImages] = useState([])
    const [editLoading, setEditLoading] = useState(false)
    const [submitFormLoading, setSubmitFormLoading] = useState(false)
    const [hasBarcode, setHasBarcode] = useState(true)
    const [selectOptions, setSelectOptions] = useState(null)
    const [errorVariants, setErrorVariants] = useState([])
    const [productId, setProductId] = useState()
    const [productStatusResponse, setProductStatusResponse] = useState({})
    const [isEditable, setIsEditable] = useState(true)

    const [model, setModel] = useState({
        baseAttributes: [
            {
                name: null,
                id: null,
                mandatory: null,
                type: null,
                multiValue: null
            }
        ],
        attributes: [

            {
                name: null,
                id: null,
                mandatory: null,
                type: null,
                multiValue: null
            }
        ],
        variantAttributes: [
            {
                name: null,
                id: null,
                mandatory: null,
                type: null,
                multiValue: null
            }
        ]
    })

    useEffect(() => {


        start()

        if (initialData?.data) {

            if (initialData.data[0].VaryantGroupID) {
                setIsVariant(true)
            }
            setVariants(initialData.data)


        }
        var initdata = initialValue;
        initdata.UrunAciklamasi = baseProductData?.description;
        initdata.UrunAdi = baseProductData?.productName;
        initdata.kg = baseProductData?.dimensionalWeight;
        initdata.price = baseProductData?.salePrice;
        initdata.stock = baseProductData.quantity;
        initdata.tax_vat_rate = baseProductData.kdv;
        initdata.merchantSku = baseProductData.sku;
        initdata.Barcode = baseProductData.barcode;

        setInitialValue(initdata)


    }, [data, isOk, result, varyantChange])

    const inputFileRef = React.useRef();
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
            setVelue("Image" + i, item)

            i++
        }
        setRefreshPage(new Date());
        document.getElementById("file-upload").value = null;



    }
    const formReset = (resetForm) => {
        resetForm();
    }


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
                        for (const item of imgs) {
                            setValue("Image" + i, item)

                            i++
                        }
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
                        clsSubmit(2)
                        setRefreshPage(new Date())
                    }
                },
                {
                    label: "Vazgeç"
                }
            ]
        })

    }

    const start = async () => {
        if (varyantList.length > 1) {
            setIsVariant(true)

        }

        if (isBrowser) {
            const urlParams = new URLSearchParams(window.location.search);
            const variantGroupId = urlParams.get('variantGroupId');
            setProductId(variantGroupId)
            var response = await GetWithToken("Hepsiburada/GetProductStatus/" + variantGroupId)


            if (response.data.isError == false) {
                setProductStatusResponse({responseData: response.data?.data?.responseData })
                setRefreshPage(new Date())
            } else {
                setProductStatusResponse(result)
            }
        }

        if (data) {
            setModel(data);
            setAttributeValues({})

            for (const item of data.variantAttributes) {
                if (item.type == "enum") {
                    await getCategoryAttribute(categoryId, item.id)
                }
            }
            for (const item of data.attributes) {
                if (item.type == "enum") {
                    await getCategoryAttribute(categoryId, item.id)
                }
            }
            for (const item of data.baseAttributes) {
                if (item.type == "enum") {
                    await getCategoryAttribute(categoryId, item.id)
                }
            }

        }
        setLoading(false)


    }

    const getCategoryAttribute = async (categoryId, attributeId) => {


        if (categoryId != null || attributeId != null) {

            var d = await GetWithToken("Hepsiburada/GetHbCategoryPropsData/" + categoryId + "/" + attributeId).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
            var attrVal = attributeValues
            var opt = [];
            if (d.data?.data) {
                for (const i of d.data?.data) {
                    opt.push({ value: i.value, label: i.value })
                }
                attrVal[attributeId] = opt;
                setAttributeValues(attrVal)
            }
        }


        // setRefreshPage(new Date())
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
        submit(2, variants)


    }

    const setImageToFormik = (setValueFiels) => {

        var i = 1;
        for (const item of images) {
            setValueFiels("Image" + i, item)

            i++
        }
        // setRefreshPage(new Date())
    }

    return (
        <>

            {refreshPage &&
                <Formik
                    initialValues={initialValue}
                    validate={values => {
                        const errors = {};
                        values.VaryantGroupID = isVariant;
                        var errVariants = []
                        model.attributes.map((item, key) => {
                            if (item.mandatory) {

                                if (!values[item.id]) {
                                    errors[item.id] = "  Bu alan boş bırakılamaz"
                                    errVariants.push(item.name)
                                }
                            }
                        })
                        model.variantAttributes.map((item, key) => {
                            if (item.mandatory) {

                                if (!values[item.id]) {
                                    errors[item.id] = "  Bu alan boş bırakılamaz"
                                    errVariants.push(item.name)
                                }
                            }
                        })
                        model.baseAttributes.map((item, key) => {

                            if (item.id == "Image1") {
                                return null
                            }
                            if (item.mandatory) {

                                if (!values[item.id]) {
                                    errors[item.id] = "  Bu alan boş bırakılamaz"
                                    errVariants.push(item.name)
                                }
                            }
                            if (item.id == "GarantiSuresi") {

                                if (values[item.id] > 99) {
                                    errors[item.id] = "  99 dan büyük olamaz"
                                    errVariants.push(item.name + " 99 dan büyük olamaz")

                                }
                            }
                        })
                        setErrorVariants(errVariants)
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {

                        setTimeout(async () => {


                            if (isVariant) {
                                if (variants.length > 0) {

                                    submit(2, variants)

                                }

                            } else {
                                if (images.length == 0) {
                                    AlertFunction("İşlem Başarısız", " En az 1 adet resim yüklenmelidir.")

                                } else {
                                    submit(2, "[" + JSON.stringify(values) + "]")
                                }

                            }

                            // submit(values)
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values, isValid, setValues, resetForm, errors }) => (
                        <Form className='row col-12 mp-form-content pl-5 pr-5 pt-5 pb-5' style={{ position: "relative" }} >

                            {
                                loading && <Image height={50} width={50} src={require("../layout/assets/images/loading.gif")}></Image>
                            }
                            <input type={"hidden"} name='VaryantGroupID' onBlur={handleBlur} onChange={handleChange} value={isVariant}></input>

                            {productStatusResponse && productStatusResponse.responseData?.isApiError == false &&


                                <div className='response  col-12 mb-3'>

                                    {
                                        productStatusResponse.responseData?.response?.data?.map((item, key) => {
                                            return <div key={key} className={"row justify-content-center " + (item.validationResults.length > 0 && "response-ty-error-content " || "response-ty-success-content")}>
                                                <div className='col-4'>
                                                    <p><b>Ürün : </b>{item.productName}</p>
                                                    <p><b>Barkod : </b>{item.barcode}</p>
                                                    <p><b>hepsiburada.com Durumu:</b> {item.productStatus}</p>
                                                </div>
                                                {
                                                    item.validationResults?.length > 0 && <><div className='col-4 row justify-content-right'>
                                                        <i className="fas fa-exclamation-triangle" style={{
                                                            fontSize: "35px",
                                                            color: "red"
                                                        }}></i> <span style={{ color: "red", fontWeight: "bold" }}>Hatalı Ürün Gönderimi</span>
                                                    </div>

                                                        <ul className='error-item-li row col-8 justify-content-start'>
                                                            {item.validationResults?.map((jitem, jkey) => {
                                                                var atrname = jitem?.attributeName.replace("fields.", "");
                                                                var dasd = model.attributes.find(x => x.id == atrname)
                                                                var attrName = model.baseAttributes.find(x => x.id == atrname) || model.attributes.find(x => x.id == atrname) || model.variantAttributes.find(x => x.id == atrname)

                                                                return <li className='col-12 text-center mb-1' style={{ listStyle: "none" }} key={jkey}><i style={{ color: "red" }} className='fas fa-exclamation-triangle'></i> <b>{attrName?.name}</b> &nbsp; {jitem.message}</li>
                                                            })}
                                                        </ul></>
                                                }
                                                {
                                                    item.validationResults?.length == 0 && <><div className='col-4 row justify-content-right'>
                                                        <i className="fas fa-check-circle " style={{
                                                            fontSize: "35px",
                                                            color: "green",
                                                            lineHeight: "31px",
                                                            marginLeft: "7px"
                                                        }}></i> <span style={{
                                                            color: "green", fontWeight: "bold",
                                                            marginTop: 4,
                                                            marginLeft: 10
                                                        }}>Ürün Başarılı Bir Şekilde Gönderildi</span>

                                                    </div>
                                                        {/* 
                                                    <ul className='error-item-li row col-8 justify-content-start'>
                                                        {item.failureReasons.map((jitem, jkey) => {
                                                            return <li key={jkey}>{jitem}</li>
                                                        })}
                                                    </ul> */}
                                                    </>
                                                }

                                            </div>
                                        })
                                    }

                                </div>

                            }
                            {productStatusResponse?.responseData && result?.responseData.isApiError &&
                                <div className='response-ty-error-content row col-12 justify-content-center pb-3 mb-3' >
                                    <div className='row col-12 text-center mb-2'>
                                        <p className='col-12'><span style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>Bu ürün Trendyola kaydedilmedi </span><br /></p>

                                    </div>
                                    <div className='row col-12'>
                                        <div className='col-6'>
                                            <b>Şu sebeplerden olabilir;</b>
                                            <ul >
                                                <li>Hepsiburada Api bilgilerinin hatalı olması</li>
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

                            <div className=' row'>
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
                                                var existVariant = variants.find(x => x.merchantSku == item.sku)
                                                if (existVariant) {
                                                    return false
                                                }
                                                return <div key={key} className={(initialValue?.merchantSku == item.sku && "clck-active-variant") + " vrlistbutton"}>
                                                    <button type='button' onClick={() => { varyantChange(item.sku); setRefreshPage(new Date()) }}>(varyant {key + 1}) <b>{item.sku}</b></button>
                                                    {initialValue?.merchantSku == item.sku && <i className='fas fa-caret-up caretup-fa'></i>}
                                                </div>
                                            })}
                                        </>
                                    }

                                </div>
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
                                <div className='row col-12 mt-4'></div>
                                {
                                    model.baseAttributes.map((item, key) => {
                                        // UrunAciklamasi:"ddd",UrunAdi:"fff",merchantSku:"hfg",tax_vat_rate:"15",stock:"5",price:5,kg:"fd"
                                        if (item.id == "VaryantGroupID" || item.id == "Image1" || item.id == "Image2" || item.id == "Image3" || item.id == "Image4" || item.id == "Image5" ||
                                            item.id == "UrunAciklamasi" || item.id == "UrunAdi" || item.id == "tax_vat_rate" || item.id == "stock" || item.id == "price" || item.id == "kg"
                                        ) {
                                            return false
                                        }
                                        return (
                                            <>

                                                {
                                                    item.type == "enum" && attributeValues[item.id].length > 0 && <>
                                                        <div className='col-6  mb-3 mt-2' key={key}>
                                                            <div className='input-label'>
                                                                <label>{item.name} </label>
                                                                {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                                {item?.id &&

                                                                    <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                                }
                                                            </div>
                                                            <Select
                                                                isClearable
                                                                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                                options={SelectHBOptionGenerator(attributeValues[item.id], selectOptions)}
                                                                // value={item.attributeValues.find(x => { return x.value == values[item.attribute.id] })}
                                                                onInputChange={(val) => {
                                                                    setSelectOptions(val)
                                                                }}
                                                                value={attributeValues[item.id]?.find(x => { return x.value == values[item.id] })}
                                                                onBlur={handleBlur} onChange={(x) => { setFieldValue(item.id, x?.value || null) }} name={item.id} ></Select>
                                                        </div></>
                                                }
                                                {item.id != "price" && item.id != "UrunAciklamasi" && item.type != "enum" && item.id != "Barcode" &&
                                                    <>
                                                        <div className='col-6  mb-3 mt-2' key={key}>
                                                            <div className='input-label'>
                                                                <label>{item.name}</label>
                                                                {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                                {item?.id &&

                                                                    <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                                }
                                                            </div>
                                                            {
                                                                item.type == "integer" &&
                                                                <input type="number" value={values[item.id]} max={item?.id == "GarantiSuresi" && 99} onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                            }
                                                            {
                                                                item.type == "string" &&
                                                                <input type="text" value={values[item.id]} onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                            }
                                                        </div>
                                                    </>
                                                }
                                                {/* {item.id == "price" && <>
                                                <div className='col-6  mb-3 mt-2' key={key}>
                                                    <div className='input-label'>
                                                        <label>{item.name}</label>
                                                        {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                        {item?.id &&

                                                            <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}>{msg}</b>}</ErrorMessage>
                                                        }
                                                    </div>
                                                    <CurrencyInput prefix='₺' value={values[item.id]} className='form-control' name='price' onBlur={handleBlur} onValueChange={(x) => { setFieldValue("price", x) }}></CurrencyInput>
                                                </div></>} */}

                                                {item.id == "Barcode" && <>
                                                    <div className='col-6  mb-3 mt-2' key={key}>
                                                        <div className='input-label'>
                                                            <label>{item.name}</label>
                                                            {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                            {item?.id &&

                                                                <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}>{msg}</b>}</ErrorMessage>
                                                            }
                                                        </div>
                                                        <div className='col-12 row '>
                                                            <div className='col-7 p-0'>
                                                                <input value={values[item.id]} disabled={!hasBarcode} type="text" onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                            </div>
                                                            <div className='col-5 row p-0'>
                                                                <div className='col ml-2 mt-2'>
                                                                    <label><input type="checkbox" onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setFieldValue("Barcode", "IENT-" + Math.floor((Math.random() * 99999999999)) + "N" + Math.floor((Math.random() * 300)))
                                                                            setHasBarcode(false)
                                                                        } else {
                                                                            setFieldValue("Barcode", "")
                                                                            setHasBarcode(true)
                                                                        }
                                                                    }} name={item.id} ></input> Barkod yok</label>
                                                                </div>

                                                            </div>

                                                        </div>
                                                    </div></>}



                                            </>
                                        )
                                    })
                                }
                                {
                                    model.attributes.map((item, key) => {


                                        if (item.id == "VaryantGroupID" || item.id == "Image1" || item.id == "Image2" || item.id == "Image3" || item.id == "Image4" || item.id == "Image5" || item.id == "GarantiSuresi") {
                                            return false
                                        }

                                        return (
                                            <>

                                                {
                                                    item.type == "enum" && attributeValues[item.id] && attributeValues[item.id].length > 0 && <>
                                                        <div className='col-6  mb-3 mt-2' key={key}>
                                                            <div className='input-label'>
                                                                <label>{item.name} </label>
                                                                {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                                {item?.id &&

                                                                    <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                                }
                                                            </div>
                                                            <Select
                                                                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                                isClearable
                                                                options={SelectHBOptionGenerator(attributeValues[item.id], selectOptions)}
                                                                // value={item.attributeValues.find(x => { return x.value == values[item.attribute.id] })}
                                                                onInputChange={(val) => {
                                                                    setSelectOptions(val)
                                                                }}
                                                                value={attributeValues[item.id]?.find(x => { return x.value == values[item.id] })}
                                                                onBlur={handleBlur} onChange={(x) => { setFieldValue(item.id, x?.value || null) }} name={item.id} ></Select>
                                                        </div>
                                                    </>
                                                }
                                                {
                                                    item.type == "integer" && <>
                                                        <div className='col-6  mb-3 mt-2' key={key}>
                                                            <div className='input-label'>
                                                                <label>{item.name}</label>
                                                                {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                                {item?.id &&

                                                                    <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                                }
                                                            </div>
                                                            <input type="number" value={values[item.id]} onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                        </div></>
                                                }
                                                {
                                                    item.type == "string" && <>
                                                        <div className='col-6  mb-3 mt-2' key={key}>
                                                            <div className='input-label'>
                                                                <label>{item.name}</label>
                                                                {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}
                                                                {item?.id &&

                                                                    <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}> {msg}</b>}</ErrorMessage>
                                                                }
                                                            </div>
                                                            <input type="text" value={values[item.id]} onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                        </div></>
                                                }



                                            </>
                                        )
                                    })
                                }

                                <div className='col-12 mt-2'>

                                    {
                                        <div className='row justify-content-center variant-content'>
                                            <div className='col-12 row  variant-content'>
                                                <div className='col-12 mb-2'>
                                                    <b>Varyant Özellikleri</b>
                                                </div>

                                                {
                                                    model.variantAttributes.map((item, key) => {
                                                        return (
                                                            <div className='col-6 mb-2 mt-2' key={key}>
                                                                <div className='input-label'>
                                                                    <label>{item.name}</label>
                                                                    {item?.mandatory && <b style={{ color: "red" }}>&nbsp; *</b>}

                                                                    {item?.id &&

                                                                        <ErrorMessage name={item?.id}>{msg => <b style={{ color: "red" }}>{msg}</b>}</ErrorMessage>
                                                                    }
                                                                </div>
                                                                {
                                                                    item.type == "enum" && <Select
                                                                        isClearable
                                                                        styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                                        options={SelectHBOptionGenerator(attributeValues[item.id], selectOptions)}
                                                                        // value={item.attributeValues.find(x => { return x.value == values[item.attribute.id] })}
                                                                        onInputChange={(val) => {
                                                                            setSelectOptions(val)
                                                                        }}
                                                                        value={attributeValues[item.id]?.find(x => { return x.value == values[item.id] })}
                                                                        onBlur={handleBlur} onChange={(x) => { setFieldValue(item.id, x?.value || null) }}  ></Select>
                                                                }
                                                                {item.id != "price" && item.id != "UrunAciklamasi" &&
                                                                    <>
                                                                        {
                                                                            item.type == "integer" && <input value={values[item.id]} type="number" onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                                        }
                                                                        {
                                                                            item.type == "string" && <input value={values[item.id]} type="text" onBlur={handleBlur} onChange={handleChange} name={item.id} className='form-control'></input>
                                                                        }
                                                                    </>
                                                                }

                                                            </div>
                                                        )
                                                    })
                                                }
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
                            <div style={{ width: 120 }}>

                                {
                                    ((isVariant) || (!isVariant && variants.length == 0)) &&

                                    <button className='btn btn-success mt-4' type='button' onClick={(x) => {
                                        var validcontrol = false;
                                        model.variantAttributes.map((item, key) => {
                                            // document.getElementsByTagName("input")[item?.id]?.value = null
                                            if (values[item.id]) {
                                                validcontrol = true
                                            }
                                        })

                                        var lnt = errorVariants.length
                                        if (lnt > 0) {
                                            confirmAlert({
                                                title: "İşlem Başarısız",
                                                message: <div className='row'><p>Lütfen zorunlu alanları doldurunuz.</p> <div className='col-12'>
                                                    {errorVariants.map((item, key) => { return <><span key={key} className='mb-2 error-items-val'>{item}</span><br /></> })}

                                                </div></div>,
                                                buttons: [
                                                    {
                                                        label: 'Tamam',
                                                        onClick: () => { }
                                                    }
                                                ]
                                            })
                                            return false
                                        }

                                        if (!validcontrol && isVariant) {
                                            AlertFunction("İşlem Başarısız", " En az 1 adet varyant özelliği girilmelidir.")
                                            return false
                                        }


                                        if (isValid && images.length > 0) {

                                            if (variants.filter(x => { return x.merchantSku == values.merchantSku }).length > 0) {
                                                AlertFunction("İşlem Başarısız", "Satıcı Stok Kodu her varyant için farklı olmalıdır. Lütfen Satıcı Stok Kodunu düzenleyip tekrar deneyiniz")
                                                return false
                                            }
                                            if (variants.filter(x => { return x.Barcode == values.Barcode }).length > 0) {
                                                AlertFunction("İşlem Başarısız", "Barkod her ürün ve varyant için farklı olmalıdır. Lütfen barkodu düzenleyip tekrar deneyiniz")
                                                return false
                                            }
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
                                                clsSubmit(2)
                                                setTimeout(() => {
                                                    setEditLoading(false)
                                                    submitForm()
                                                }, 500);
                                            } else {
                                                AlertFunction("İşlem Başarısız", "Bu varyantın aynısı zaten var. Lütfen değişiklik yaparak varyant ekleyin")
                                            }
                                        } else {
                                            // if (!isValid) {
                                            //     AlertFunction("İşlem Başarısız", " Lütfen zorunlu alanları doldurunuz.")

                                            // } else if (!validcontrol && isVariant) {

                                            //     AlertFunction("İşlem Başarısız", " En az 1 adet varyant özelliği girilmelidir.")
                                            // }

                                        }
                                        if (images.length == 0) {
                                            AlertFunction("İşlem Başarısız", " En az 1 adet resim yüklenmelidir.")

                                        }

                                    }}><i className='fa fa-plus'></i> <b>Ekle</b>  </button>}
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
                                                return <div key={key} className='row col-12 justify-content-center vr-list-cnt mb-2'><div className='row  justify-content-center' style={{
                                                    background: "white",
                                                    padding: "5px",
                                                }}>
                                                    <div><b style={{ fontSize: 14 }}>{key + 1}&nbsp;-&nbsp;</b></div>

                                                    <div className='mr-3'><b>Ürün Adı</b> : {item["UrunAdi"] || "(Boş)"} </div>
                                                    <div><b>Barkod</b> : {item["Barcode"] || "(Boş)"} </div>
                                                    {
                                                        model.variantAttributes.map((jitem, jkey) => {
                                                            return (
                                                                <div key={jkey} className='ml-2 mb-1 row'>
                                                                    <div className='ml-3'>    <b>{jitem.name} </b> : {item[jitem.id] || "(Boş)"} </div>
                                                                </div>
                                                            )
                                                        })
                                                    }

                                                    <div className='ml-4 mr-2 variant-detail-button' onClick={() => {

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

                                                    }}><i className='fa fa-copy '></i> Kopyala</div>


                                                    <div className='ml-1 mr-2 variant-del-button' onClick={() => { deleteVariant(item); }}><i className='fa fa-trash'></i> Sil</div>

                                                </div>
                                                </div>
                                            })}
                                        </div>

                                    </div>


                                    <div className='row col-12'>



                                        {/* {variants.length > 0 && <div className='row col-2'>
                                    <button type='button' disabled={isSubmitting} onClick={() => {


                                        if (isVariant && variants.length == 0) {
                                            AlertFunction("Kayıt Oluşturulamaz", "Hiçbir varyant eklenmediğinden dolayı kayıt oluşturma yapılamıyor.")
                                        } else {
                                            submitForm()
                                            setImages([])
                                            // resetForm()
                                            // setInitialValue({})   
                                            start()
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
                                        }

                                    }} className={"mt-4 btn ccsz " + (submitFormLoading && " loading-button") + (isOk && " btn-success " || " btn-warning ")} >
                                       
                                    </button>

                                </div>} */}
                                        {variants.length > 0 &&
                                            <b className='d-block mt-4 complete-form-warn'><i className='fa fa-check-circle'></i> Kayıt İçin Uygun</b>}
                                        {isOk && <div className='row col-2'>


                                            <button className=' btn btn-danger ml-2 mt-4'
                                                onClick={() => {
                                                    // submitForm()
                                                    setImages([])
                                                    setVariants([])
                                                    clsSubmit(2)
                                                    // resetForm()
                                                    // start()



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

                        </Form>
                    )
                    }
                </Formik >
            } </>)

}