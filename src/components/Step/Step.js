/* eslint-disable */

// react
import { useEffect, useState } from 'react';

// components
import StepPassword from './StepPassword';

// style
import styled from 'styled-components';

// image
import profile from '../../assets/images/noProfile.png';

// sweetalert
import Swal from 'sweetalert2';

// axios
import instance from '../../shared/axios';
import StepPhone from './StepPhone';

const Step = ({ step, onCountChange, onSignup }) => {
  // 패스워드 일치 여부
  const [passwordMatch, setPasswordMatch] = useState(false);

  // 유효성 검사 체크
  const [validation, setValidation] = useState({
    nickname: false,
    username: false,
    password: false,
    phoneNumber: false,
  });

  // 유효성 검사 함수
  const checkValidation = (value) => {
    let regExp = '';

    switch (curData) {
      case 'nickname': {
        regExp = /^[a-zA-Z가-힣0-9]{3,9}$/;
        break;
      }
      case 'username': {
        regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        break;
      }
      case 'password': {
        regExp = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;
        break;
      }
      case 'phoneNumber': {
        regExp = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{5})$/;
        break;
      }
      default: {
        return;
      }
    }

    const result = regExp.test(value);
    setValidation({ ...validation, [curData]: result });
  };

  // 비밀번호 보이기, 안보이기
  const [isShowPassword, setIsShowPassword] = useState(false);

  const [userInfo, setUserInfo] = useState({
    nickname: '',
    username: '',
    password: '',
    phoneNumber: '',
    userImage: '',
  });

  const [passwordCheckValue, setPasswordCheckValue] = useState('');

  const userInfoArr = ['agree', 'nickname', 'username', 'password', 'phoneNumber', 'userImage'];

  // 현재 입력될 input의 이름
  const curData = userInfoArr[step];

  // 이전에 입력된 input의 이름
  const prevData = step !== 0 && userInfoArr[step - 1];

  const [imageData, setImageData] = useState({ previewImage: '', imageFile: '' });

  // 회원가입 버튼을 클릭하면
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (isSubmit) {
      onSignup(userInfo);
    }
  }, [isSubmit]);

  // 업로드 이미지 -> 서버 통신
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append('file', imageData.imageFile);
    try {
      // 서버 이미지 업로드 api 필요
      const response = await instance.post('/user/image', formData);
      console.log(response.data.id);
      // 유저 정보에 서버 이미지 url 저장
      setUserInfo({ ...userInfo, [curData]: response.data.id });
    } catch (error) {
      console.log(error);
      setIsSubmit(false);
    }
  };

  // 입력 값 유저 정보 state에 넣기
  const handleEnteredInfo = async (event) => {
    // 이미지 업로드할 때
    if (curData === 'userImage') {
      const uploadFile = event.target.files[0];

      if (uploadFile) {
        const previewImagePath = URL.createObjectURL(uploadFile);
        setImageData({ previewImage: previewImagePath, imageFile: uploadFile });
      } else {
        setImageData({ previewImage: '', imageFile: '' });
        setUserInfo({ ...userInfo, userImage: '' });
        return;
      }
      return;
    }

    // 숫자 이외의 값 입력 방지
    if (curData === 'phoneNumber') {
      if (isNaN(Number(event.target.value))) {
        return;
      }
    }

    // 별명, 이메일, 핸드폰 번호 중복 여부 갱신
    if (curData === 'nickname' || curData === 'username' || curData === 'phoneNumber') {
      setIsDuplicated({ ...isDuplicated, [curData]: false });
      if (curData === 'phoneNumber') {
        setIsDuplicated({ ...isDuplicated, [curData]: false });
        setIsAuthorized(false);
        setPhoneMessage(false);
        setAuthMessage(false);
        setIsSendCode(false);
      }
    }

    // img 외의 값 유효성 검사
    checkValidation(event.target.value);
    setUserInfo({ ...userInfo, [curData]: event.target.value });
  };

  // 비밀번호 일치 확인
  useEffect(() => {
    if (validation.password && userInfo.password === passwordCheckValue) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [validation.password, userInfo.password, passwordCheckValue]);

  // 이전 단계, 다음 단계 이동
  const handleStepMove = (moveStep) => {
    if (step === 1 && moveStep === -1) {
      setAgreeArr({ all: false, first: false, second: false });
      setIsAllAgree(false);
    }

    // 페이지 이동이 일어날 때
    if (step !== 0 && moveStep === -1) {
      setUserInfo({ ...userInfo, [prevData]: '', [curData]: '' });
      setValidation({ ...validation, [prevData]: false, [curData]: false });

      // 비밀번호 입력 페이지
      // 비밀번호 관련 값 초기화
      if (step === 3 || (step === 4 && moveStep === -1)) {
        setPasswordCheckValue('');
        setIsShowPassword(false);
      }

      // 휴대폰 인증 페이지
      // 인증 관련 값 초기화
      if (step === 4 || (step === 5 && moveStep === -1)) {
        setAuthNumber('');
        setIsAuthorized(false);
      }

      // 별명, 이메일, 휴대폰 인증 중복 체크
      if (step === 1 || step === 2 || step === 4) {
        setIsDuplicated({ ...isDuplicated, [curData]: false });
      }
    }

    // 페이지 이동
    onCountChange(moveStep);
  };

  // 인증했는지 여부
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDuplicated, setIsDuplicated] = useState({ nickname: true, username: true, phoneNumber: true });

  // 가입하기
  const singup = async () => {
    imageData.previewImage && (await uploadImage());
    setIsSubmit(true);
  };

  // step별 화면 보여주기
  let content = '';

  // 약관 동의 체크
  const [agreeArr, setAgreeArr] = useState({ all: false, first: false, second: false });
  const [isAllAgree, setIsAllAgree] = useState(false);

  const handleAgreeCheck = (index) => {
    if (index === 'all') {
      const result = agreeArr['all'] ? true : false;
      setIsAllAgree(!result);
      setAgreeArr({
        all: !result,
        first: !result,
        second: !result,
      });
      return;
    }

    for (const key in agreeArr) {
      if (key !== 'all' && index !== key && !agreeArr[index] && agreeArr[key]) {
        setAgreeArr({ ...agreeArr, all: true, [index]: !agreeArr[index] });
        setIsAllAgree(true);
        return;
      } else {
        setIsAllAgree(false);
      }
    }

    !agreeArr[index] && setAgreeArr({ ...agreeArr, [index]: !agreeArr[index] });
    agreeArr[index] && setAgreeArr({ ...agreeArr, all: false, [index]: !agreeArr[index] });
  };

  // 약관 동의 페이지
  if (step === 0) {
    content = (
      <StepBox>
        <Title>약관동의</Title>
        <Guide>
          <GuideBox>
            <div>회원가입 전, ANYZOO 약관을 확인해주세요.</div>
          </GuideBox>
          <GuideList onClick={() => handleAgreeCheck('all')}>
            <span>약관 전체동의</span>
            <div className={agreeArr['all'] ? 'box checked' : 'box'}></div>
          </GuideList>
          <GuideList onClick={() => handleAgreeCheck('first')}>
            <span>이용약관 동의(필수)</span>
            <div className={agreeArr['first'] ? 'box checked' : 'box'}></div>
          </GuideList>
          <GuideList onClick={() => handleAgreeCheck('second')}>
            <span>개인정보 수집 및 이용동의(필수)</span>
            <div className={agreeArr['second'] ? 'box checked' : 'box'}></div>
          </GuideList>
        </Guide>
      </StepBox>
    );
  }

  // 별명 페이지
  if (step === 1) {
    content = (
      <StepBox>
        <span className='desc'>
          <p>
            당신의 <span className='strong'>별명</span>은?
          </p>
        </span>
        {userInfo[curData].trim().length !== 0 && !validation[curData] && (
          <Validation>*영문자, 한글, 숫자, 3~10글자</Validation>
        )}
        {userInfo[curData].trim().length !== 0 && isDuplicated[curData] && (
          <Validation>*이미 등록된 별명이에요.</Validation>
        )}
        <SingleInput value={userInfo.nickname} onChange={handleEnteredInfo} type='text' placeholder='홍길동' />
      </StepBox>
    );
  }

  // 이메일 페이지
  if (step === 2) {
    content = (
      <StepBox>
        <span className='desc'>
          <p>
            <span className='strong'>이메일</span>을
          </p>
          <p>입력해주세요.</p>
        </span>
        {userInfo[curData].trim().length !== 0 && !validation[curData] && (
          <Validation>*이메일 형식이 유효하지 않아요.</Validation>
        )}
        {userInfo[curData].trim().length !== 0 && isDuplicated[curData] && (
          <Validation>*이미 등록된 이메일이에요.</Validation>
        )}
        <SingleInput
          value={userInfo.username}
          onChange={handleEnteredInfo}
          type='text'
          placeholder='이메일을 입력해주세요.'
        />
      </StepBox>
    );
  }

  // 비밀번호 확인 값
  const handleEnteredPwdCheck = (event) => {
    setPasswordCheckValue(event.target.value);
  };

  const handleSetIsShowPassword = (value) => {
    console.log(value);
    setIsShowPassword(value);
  };

  // 비밀번호 페이지
  if (step === 3) {
    content = (
      <StepBox>
        <StepPassword
          text='비밀번호를입력해주세요.'
          userPassword={userInfo[curData]}
          setEnteredPassword={handleEnteredInfo}
          validation={validation[curData]}
          isShowPassword={isShowPassword}
          passwordMatch={passwordMatch}
          passwordCheckValue={passwordCheckValue}
          setEnteredPasswordCheckValue={handleEnteredPwdCheck}
          setIsShowPassword={handleSetIsShowPassword}
        />
      </StepBox>
    );
  }

  console.log(userInfo);

  useEffect(() => {}, [isDuplicated.phoneNumber]);

  // 인증코드 입력
  const [authNumber, setAuthNumber] = useState('');

  const handleSetAuthNumber = (event) => {
    setAuthNumber(event.target.value);
  };

  // 인증번호 일치 여부 확인
  const checkedAuthNumber = async () => {
    // true면 등록된 번호, false면 미등록 번호
    console.log('인증번호 비교');
    console.log(isDuplicated.phoneNumber);

    if (isDuplicated.phoneNumber || !isSendCode) {
      setAuthMessage(true);
      return;
    }

    setAuthMessage(false);

    console.log('핸드폰 번호: ', userInfo.phoneNumber);
    console.log('인증 번호: ', authNumber);

    try {
      const response = await instance.post('/user/confirm/phoneVerification', {
        phoneNumber: userInfo.phoneNumber,
        numStr: authNumber,
      });

      // 인증코드가 일치하면 true, 다르면 false
      console.log('코드 일치 여부');
      console.log(response.data);
      setIsAuthorized(response.data);
      response.data && handleStepMove(1);
    } catch (error) {
      console.log(error);
    }
  };

  const [phoneMessage, setPhoneMessage] = useState(false);
  const [authMessage, setAuthMessage] = useState(false);
  const [isSendCode, setIsSendCode] = useState(false);

  const handleSetPhoneMessage = (value) => {
    setPhoneMessage(value);
  };

  // 휴대폰 인증 페이지
  if (step === 4) {
    content = (
      <StepBox>
        <StepPhone
          userPhoneNumber={userInfo[curData]}
          validation={validation[curData]}
          isDuplicated={isDuplicated[curData]}
          authMessage={authMessage}
          phoneMessage={phoneMessage}
          setPhoneMessage={handleSetPhoneMessage}
          handleInputDuplicated={handleInputDuplicated}
          setEnteredPhoneNumber={handleEnteredInfo}
          setAuthNumber={handleSetAuthNumber}
          authNumber={authNumber}
        />
      </StepBox>
    );
  }

  // 기본 이미지 클릭하면 파일 선택하기 창 띄우기
  const handleSelectImg = () => {
    const img = document.querySelector('.selectImg');
    img.addEventListener('click', img.click());
  };

  // 프로필 이미지 페이지
  if (step === 5) {
    content = (
      <StepBox>
        <span className='desc'>
          <p>마지막으로</p>
          <p>
            <span className='strong'>프로필이미지</span>를
          </p>
          <p>설정해주세요.</p>
        </span>
        <Profile>
          <img
            className='defaultImg'
            src={imageData.previewImage || profile}
            alt='profile'
            accept='image/*'
            onClick={handleSelectImg}
          />
          <input className='selectImg' onChange={handleEnteredInfo} type='file' accept='image/*' />
        </Profile>
      </StepBox>
    );
  }

  // 핸드폰으로 코드 받기
  const sendCode = async () => {
    console.log('코드 발급 함수 실행');
    try {
      const response = await instance.get(`/user/send/phoneVerification/${userInfo.phoneNumber}`);
      Swal.fire({
        title: '인증번호를 발송했어요!',
        icon: 'success',
        confirmButtonText: '확인',
        confirmButtonColor: '#44DCD3',
      });
      console.log(response.data);
      setIsSendCode(true);
      setAuthMessage(false);
    } catch (error) {
      console.log(error);
    }
  };

  // 사용자 입력 중복체크
  const handleInputDuplicated = async () => {
    if (curData === 'nickname') {
      console.log('별명 중복체크');
      try {
        const response = await instance.get(`/user/checkNickname/${userInfo.nickname}`);
        if (response.data) {
          setIsDuplicated({ ...isDuplicated, [curData]: response.data });
          return;
        }
        handleStepMove(1);
      } catch (error) {
        console.log(error);
      }
    }

    if (curData === 'username') {
      console.log('이메일 중복체크');
      try {
        const response = await instance.get(`/user/checkUsername/${userInfo.username}`);

        if (response.data) {
          setIsDuplicated({ ...isDuplicated, [curData]: response.data });
          return;
        }
        setIsDuplicated({ ...isDuplicated, [curData]: response.data });
        handleStepMove(1);
      } catch (error) {
        console.log(error);
      }
    }

    if (curData === 'phoneNumber') {
      console.log('번호 중복 체크');
      try {
        const response = await instance.get(`/user/checkPhoneNumber/${userInfo.phoneNumber}`);
        console.log(response.data);
        if (response.data) {
          setIsDuplicated({ ...isDuplicated, [curData]: response.data });
          return;
        }
        setIsDuplicated({ ...isDuplicated, [curData]: response.data });
        setIsSendCode(true);
        sendCode();
      } catch (error) {
        console.log(error);
      }
    }
  };

  let buttons = '';

  if (step === 0) {
    buttons = (
      <ButtonBox step={step} width='100%' validation={isAllAgree}>
        {/* <NextBtn onClick={() => isAllAgree && handleStepMove(1)}>다음</NextBtn> */}
        <NextBtn onClick={() => handleStepMove(1)}>다음</NextBtn>
      </ButtonBox>
    );
  }

  if (step === 1 || step === 2) {
    buttons = (
      <ButtonBox step={step} validation={validation[curData]}>
        <PrevBtn onClick={() => handleStepMove(-1)}>이전 단계</PrevBtn>
        <NextBtn onClick={() => validation[curData] && handleInputDuplicated()}>다음 단계</NextBtn>
        {/* <NextBtn onClick={() => handleStepMove(1)}>다음 단계</NextBtn> */}
      </ButtonBox>
    );
  }

  if (step === 3) {
    buttons = (
      <ButtonBox step={step} validation={step === 3 ? passwordMatch : validation[curData]}>
        <PrevBtn onClick={() => handleStepMove(-1)}>이전 단계</PrevBtn>
        {/* <NextBtn onClick={() => validation[curData] && handleStepMove(1)}>다음 단계</NextBtn> */}
        <NextBtn onClick={() => handleStepMove(1)}>다음 단계</NextBtn>
      </ButtonBox>
    );
  }

  if (step === 4) {
    buttons = (
      <ButtonBox step={step} validation={!isDuplicated[curData]}>
        <PrevBtn onClick={() => handleStepMove(-1)}>이전 단계</PrevBtn>
        <NextBtn onClick={() => checkedAuthNumber()}>다음 단계</NextBtn>
      </ButtonBox>
    );
  }

  if (step === 5)
    buttons = (
      <ButtonBox step={step} validation={validation[curData]}>
        <PrevBtn onClick={() => handleStepMove(-1)}>이전 단계</PrevBtn>
        <PrevBtn step={step} onClick={() => singup()}>
          가입하기
        </PrevBtn>
      </ButtonBox>
    );

  return (
    <Container>
      {content}
      {buttons}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 95%;
  height: 100%;
  .desc {
    display: block;
    font-size: 20px;
    margin: 10vw 0 5vw 0;
  }
  .strong {
    font-weight: bold;
  }
  p {
    display: block;
    margin-bottom: 5px;
  }
  input[type='file'] {
    display: none;
  }
`;

const SingleInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 3.25% 10px;
  font-size: 20px;
  margin-top: 10vw;
  border-bottom: 3px solid #000000;
  &:last-of-type {
    margin-bottom: 5vw;
  }
  &::placeholder {
    font-size: 20px;
    font-weight: 800;
    color: rgba(0, 0, 0, 0.3);
  }
  &[type='file'] {
    display: none;
  }
`;

const Title = styled.span`
  display: block;
  padding-top: 10%;
  font-size: 30px;
  font-weight: bold;
  color: ${(props) => props.theme.color.grey};
`;

const Profile = styled.div`
  text-align: center;
  margin: 10vw 0;
  .defaultImg {
    cursor: pointer;
    border-radius: 50%;
    width: 180px;
    height: 180px;
  }
`;

const StepBox = styled.div``;

const Guide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 800;
  width: 100%;
  margin: 10% 0 5% 0;
`;

const GuideBox = styled.div`
  width: 85%;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 27px;
  border-radius: 30px;
  background-color: ${(props) => props.theme.color.lightGrey};
  div {
    font-size: 20px;
    color: rgba(0, 0, 0, 0.6);
  }
`;

const GuideList = styled.div`
  width: 85%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    border: 2px solid #ababab;
    overflow: hidden;
  }
  .box.checked {
    &::after {
      content: '✔';
      background-color: ${(props) => props.theme.color.activeBtn};
      color: #ffffff;
      font-size: 20px;
      width: 100%;
      height: 100%;
    }
  }
  span {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
  }
`;

const Validation = styled.span`
  display: block;
  color: red;
  font-size: 14px;
  margin-bottom: 2%;
  &:last-of-type {
    margin-bottom: 8.3%;
  }
`;

const PrevBtn = styled.button``;
const NextBtn = styled.button``;
const ButtonBox = styled.div`
  display: flex;
  height: 15vw;
  justify-content: space-between;
  button {
    font-size: 16px;
    width: 47%;
    background-color: #ccc;
    border-radius: 10px;
    font-weight: 800;
    color: #333333;
  }
  ${PrevBtn} {
    transition: 0.5s;
    background-color: #f2f2f2;
  }
  ${PrevBtn}:hover {
    background-color: ${(props) => props.theme.color.activeBtn};
  }
  ${NextBtn} {
    width: ${(props) => props.width};
    background-color: ${(props) => (props.validation ? props.theme.color.activeBtn : props.theme.color.inactiveBtn)};
    cursor: ${(props) => props.validation && 'pointer'};
    transition: 0.5s;
  }
`;

export default Step;
