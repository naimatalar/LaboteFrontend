
import React, { useEffect, useState } from 'react';
import { PostNoneToken } from '../api/crud';

export default function Login() {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [isError, setIsError] = useState();
    const [buttonLoad, setButtonLoad] = useState(false)
    useEffect(()=>{
     localStorage.removeItem("usrtknantegra");
    },[])
    const login = async () => {
        setButtonLoad(true)
        
        if (userName == "" || password == "") {

            setIsError(true)
            return false;
        }
        var d = await PostNoneToken("Auth/Login", { userName: userName, password: password }).then(x => { return x.data })
     
        if (d.error) {  
             setButtonLoad(false)
            setIsError(true)
            return false;
        }

        localStorage.setItem("usrtknantegra", d.token)

        location.reload();
    }

    return <div className="page-content">
        <div className="content-wrapper">
            <div className="content d-flex justify-content-center align-items-center">


                <div className="card mb-0">
                    <div className="card-body">
                        <div className="text-center mb-3">
                            <i className="icon-reading icon-2x text-slate-300 border-slate-300 border-3 rounded-round p-3 mb-3 mt-1"></i>
                            <h5 className="mb-0">Antegra Giriş Formu</h5>
                            <span className="d-block text-muted">Kullanıcı adı yada mail adresinizi şifrenizle beraber giriniz</span>
                        </div>

                        <div className="form-group form-group-feedback form-group-feedback-left">
                            <input type="text" className="form-control" value={userName} onChange={(x) => { setUserName(x.target.value) }} placeholder="Username"></input>
                            <div className="form-control-feedback">
                                <i className="icon-user text-muted"></i>
                            </div>
                        </div>

                        <div className="form-group form-group-feedback form-group-feedback-left">
                            <input type="password" value={password} onChange={(x) => { setPassword(x.target.value) }} className="form-control" placeholder="Password"></input>
                            <div className="form-control-feedback">
                                <i className="icon-lock2 text-muted"></i>
                            </div>
                        </div>

                        <div className="form-group">
                            <button type="submit" disabled={buttonLoad} onClick={() => { login() }} className={"btn btn-primary btn-block "+(buttonLoad&&" loading-button")}><span>Giriş  <i className="icon-circle-right2 ml-2"></i></span></button>

                            {isError &&
                                <div className="text-center key-alert mt-3">
                                    <div className='text-danger'>
                                        <i className="icon-alert text-danger "></i>   <b>Giriş hatalı !</b>
                                    </div>
                                </div>
                            }
                        </div>


                        <div className="text-center">
                            <a href="login_password_recover.html">Şifremi unmuttum</a>
                        </div>
                    </div>
                </div>

            </div>




        </div>


    </div>

}