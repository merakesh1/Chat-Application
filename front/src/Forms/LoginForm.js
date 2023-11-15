import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../Images/background.jpg';

const LoginForm = () => {
    useEffect(() => {
        emailInputRef.current.focus();
    }, []);
    const [loginData, setLoginData] = useState({
        Email: "",
        Password: "",
        showPassword: false
    });
    const emailInputRef = useRef(null);
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        const { Email, Password } = loginData;
        if (!Email || !Password) {
            alert("Please fill all the fields");
            return;
        }
        const response = await fetch(`${process.env.REACT_APP_HTTP}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        })
        const main_response = await response.json();
        // console.log(main_response);
        if (main_response) {
            if (main_response.error) {
                alert(main_response.error);
                setLoginData({
                    Email: "",
                    Password: ""
                });
                return;
            }
            sessionStorage.setItem("user", JSON.stringify({ token: main_response.token, userName: main_response.username, userId: main_response._id }));
            navigate("/");
        }
        else {
            alert("Something went wrong");
        }
    }

    const handleForget = async (e) => {
        e.preventDefault();
        const email = window.prompt("Enter your email to know the password!");
        const response = await fetch('http://127.0.0.1:5000/forget', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });
        const main_response = await response.json();
        if (main_response.error) {
            alert(main_response.error);
            return;
        }
        alert("Your password is " + main_response.password);
    }
    return (
        <>
            <div style={{ backgroundColor: "#eee", height: "100vh", backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover" }}>
                <div className='container-sm w-90 mx-auto'>
                    <section className="vh-100 gradient-custom">
                        <div className="container py-5 h-100">
                            <div className="row justify-content-center align-items-center h-100">
                                <div className="col-12 col-lg-9 col-xl-7">
                                    <div className="card shadow-2-strong card-registration" style={{ borderRadius: "15px" }}>
                                        <div className="card-body p-4 p-md-5">
                                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-5">Login Form</h3>
                                            <form>
                                                <div className="form-outline mb-4">
                                                    <input name='email' type="email" id="form2Example1" className="form-control" placeholder='Email address' value={loginData.Email} onChange={(e) => setLoginData({ ...loginData, Email: e.target.value })} ref={emailInputRef}/>
                                                </div>

                                                <div className="form-outline mb-4">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                                        <input className="form-control" type={loginData.showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={loginData.Password} onChange={(e) => setLoginData({ ...loginData, Password: e.target.value })} />
                                                        <span className="input-group-text justify-content-center" style={{ width: '40px', cursor: 'pointer' }}><i className={loginData.showPassword ? 'far fa-eye' : 'far fa-eye-slash'} onClick={() => {
                                                            setLoginData({ ...loginData, showPassword: !loginData.showPassword })
                                                        }
                                                        }></i></span>
                                                    </div>
                                                </div>

                                                <button type="button" className="btn btn-primary btn-block mb-4" onClick={(e) => login(e)}>Sign in</button>

                                                <div className='row'>
                                                    <div className="col-md-6">
                                                        <div className="ml-3">
                                                            <p>Not a member? <Link to='/signup'>Register</Link></p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 d-flex justify-content-end">
                                                        <div className="col">
                                                            <button id='link-btn' type="button" onClick={(e) => handleForget(e)} >Forgot password?</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default LoginForm

