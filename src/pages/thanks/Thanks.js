import React, { useState, useEffect } from "react";
import { Grid, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from "@material-ui/core";
import axios from "axios";
import config from '../../config';

// styles
import useStyles from "./styles";

// components
import PageTitle from "../../components/PageTitle/PageTitle";
import Widget from "../../components/Widget/Widget";
import { useUserState } from "../../context/UserContext";
import { Button } from '../../components/Wrappers/Wrappers';
import classnames from 'classnames';
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function ThanksPage() {

  const history = useHistory();
  const { authId, authEmail } = useUserState();
  const [status, setStatus] = useState(false);
//   const [currPage, setCurrPage] = useState(1);
//   const [currLimit, setCurrLimit] = useState(5);
//   const [nextPage, setNextPage] = useState('');
//   const [nextLimit, setNextLimit] = useState('');
//   const [limit, setLimit] = useState(5);
//   const [allAns, setAllAns] = useState([]);
//   const [allTempAns, setAllTempAns] = useState([]);
//   const [studentAns, setStudentAns] = useState({
//     "student_id": authId,
//     "answer": allTempAns,
//   });

//   const handleChange = (event, index) => {
//     const { name, value, checked } = event.target;
//     console.log(name + '   ' + value);
//     setAllAns(prevState => ({
//       ...prevState,
//       [name]: parseInt(value)
//     }));
//     let markers = allTempAns;
//     markers[index] = { ...allTempAns[index], "question_id": name, "answer_id": parseInt(value) };
//     setAllTempAns(markers);
//   };

//   console.log(studentAns);

//   const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchData() {
       await axios(
        config.baseUrl + `getcode?id=${authId}`, {
        method: 'GET',
        headers: {},
        data:{},
        withCredentials: null
      })
        .then(response => {
          if(response.status){
            setStatus(true);
          }else{
            setStatus(false);
          }
        }).catch(error => {});
    }
    fetchData();
  }, []);

  async function handleClick() {
    if(status){
      history.push('/app/editor')
    }
  }

// const answerCheck = async()=>{
//   const studentAnswers = await axios(config.baseUrl + `getsubmitedanswers?id=${authId}`, {method: 'GET',withCredentials: null})
//   const answerCall = await axios(config.baseUrl + 'getanswers', {method: 'GET',withCredentials: null})
//   let arr1 = answerCall.data.answers[0].answer
//   let arr2 = studentAnswers.data.result.answer
//   console.log(arr1, arr2)
//   let count = 0;
//     arr1.filter(el => {
//       return !arr2.find(element => {
//         if(element.question_id === el.question_id && element.answer_id === el.answer_id){
//           count +=1;
//         }
//       });
//     });
//     const response = await axios(
//       config.baseUrl + 'score', {
//       method: 'POST',
//       headers: {},
//       data: {
//         email : authEmail,
//         score : count,
//       },
//       withCredentials: null
//     })
//     history.push('/app/dashboard')
//     return count;
// }


  return (
    <>
      <PageTitle title="Results" />
      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <Widget title="" disableWidgetMenu>
            <h1>Thanks for submiting your answers !</h1>
            <br/>
            <br/>
            {status ? <h2>Congrats you are eligible for next round !</h2> : <h2>We will get back to you soon.</h2>}
            <br/>
            <br/>
            {/* <Button variant="contained" color={'primary' } >Submit</Button> */}
            {status && <Button variant="contained" color={status ? 'success' : 'primary'} onClick={handleClick} > Code Challange</Button>}
            
          </Widget>
        </Grid>
      </Grid>
    </>
  );
}
