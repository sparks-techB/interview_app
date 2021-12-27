import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Grid, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Button } from "@material-ui/core";
import PageTitle from "../../components/PageTitle/PageTitle";
import Widget from "../../components/Widget/Widget";

import { useUserState } from "../../context/UserContext";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import "./App.css";
import axios from "axios";
import config from '../../config';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const window = (new JSDOM('')).window
const DOMPurify = createDOMPurify(window)

function App() {
    const [html, setHtml] = useLocalStorage('html', '')
    const [css, setCss] = useLocalStorage('css', '')
    const [js, setJs] = useLocalStorage('js', '')
    const [srcDoc, setSrcDoc] = useState('')
    const [challengeId, setChallengeId] = useLocalStorage('challengeId', '');
    const [questionId, setquestionId] = useLocalStorage('questionId','');

    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = useState(false);
    const [challengeQues, setChallengeQues] = React.useState(false);
    const [challengeSampleOut, setChallengeSampleOut] = React.useState(false);
    const { authId, authEmail } = useUserState();
    const history = useHistory();

    const handleClickOpen = async () => {
        setOpen(true);
    };

    const handleSubmit = async () => {
        const response = await axios(
            config.baseUrl + `editoranswers`, {
            method: 'POST',
            headers: {},
            data: {
                "student_id": authId,
                "question_id": questionId,
                html,
                css,
                js
            },
            withCredentials: null
        })
            .then(response => {
                setOpen(false);
                history.push('/app/thanks')
                console.log(response);
            }).catch(error => { alert("Something went wrong !")});
    };

    const handleClose = () => {
        setOpen(false);
    };

    var Ids = [1, 2, 3];
    var randomId = Ids[Math.floor(Math.random() * Ids.length)];

useEffect(() => {
    async function fetchData() {
        await axios(
        config.baseUrl + `getcode?id=${authId}`, {
        method: 'GET',
        headers: {},
        data: {},
        withCredentials: null
        })
        .then(response => {
            console.log("getcode",response);
            if(response.status === 201){
            setStatus(true);
            }else{
            setStatus(false);
            }
        }).catch(error => { history.push('/app/thanks')});
    }
    fetchData();
}, []);

    useEffect(() => {
        if (challengeId) {
            console.log(challengeId);
        } else {
            setChallengeId(randomId);
        }
        const quesId = challengeId ? challengeId : randomId;

            async function fetchData() {
                const response = await axios(
                    config.baseUrl + `getChallange?id=${quesId}`, {
                    method: 'GET',
                    headers: {},
                    data: {},
                    withCredentials: null
                })
                    .then(response => {
                        setquestionId(response?.data?._id)
                        setChallengeQues(response?.data?.content?.title);
                        setChallengeSampleOut(response?.data?.content?.img_url);
                    }).catch(error => {alert("Something went wrong !") });
            }
            fetchData();

    }, [status]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `)
        }, 250)
        return () => clearTimeout(timeout)
    }, [html, css, js])

    return (
        <>
            <Grid container spacing={0}>
                <Grid item xs={8} md={8}>{<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(challengeQues) }} />}</Grid>
                <Grid item xs={4} md={4}>
                    <h2>Sample Output:</h2>
                    <br />
                    <img src={challengeSampleOut} />
                </Grid>
            </Grid>
            <Grid container spacing={0}>
                <Grid item xs={2} md={2}>
                    <p>Please submit! when the result is achived.</p>
                </Grid>
                <Grid item xs={8} md={8}>
                    <Button style={{ marginLeft: 15 }} variant="contained" color="success" onClick={handleClickOpen}>Submit</Button>
                </Grid>
            </Grid>
            <br />
            <Grid container spacing={0}>
                <Grid item xs={6} md={6}>
                    <section className="playground">
                        <div className="code-editor html-code">
                            <div className="editor-header">HTML</div>
                            <Editor
                                language="xml"
                                displayName="HTML"
                                value={html}
                                onChange={setHtml}
                            />
                        </div>
                        <div className="code-editor css-code">
                            <div className="editor-header">CSS</div>
                            <Editor
                                language="css"
                                displayName="CSS"
                                value={css}
                                onChange={setCss}
                            />
                        </div>
                        <div className="code-editor js-code">
                            <div className="editor-header">JavaScript</div>
                            <Editor
                                language="javascript"
                                displayName="JS"
                                value={js}
                                onChange={setJs}
                            />
                        </div>
                    </section>
                </Grid>
                <Grid item xs={6} md={6}>
                    <section className="result">
                        <iframe
                            className="iframe"
                            srcDoc={srcDoc}
                            title="result"
                            sandbox="allow-scripts"
                        />
                    </section>
                </Grid>
            </Grid>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title"></DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure want to submit the Code Challenge?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        No
                    </Button>
                    <Button onClick={handleSubmit} color="primary" autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default App;
