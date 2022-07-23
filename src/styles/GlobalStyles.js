import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyles = createGlobalStyle`
    ${reset};
    html {
        font-size: min(2.67vw, 14px);
    }
    a{
        text-decoration:none;
        color:inherit;
    }
    *{
        box-sizing:border-box;
    }
    body{
        // 폰트 스타일 적용
        /* font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; */
        
        // 기본 폰트 컬러 
        // color: ${props => props.theme.color.blue}
    }
    input {
        outline: none;
        border: none;
    }
    button {
        cursor: pointer;
        outline: none;
        border: none;
    }
`;

export default GlobalStyles;
