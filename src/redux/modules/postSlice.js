import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";


// //읽기
// export const getDataDB = () => {
//   return async (dispatch) => {
//     try {
//       const response = await axios.get("http://localhost:5000/post");
//       dispatch(setData(response.data));
//     } catch (err) {
//       console.log(err);
//     }
//   };
// };

// 추가하기
export const addDataDB = (data) => {
  return async (dispatch) => {
    try {
      const response = await axios.post("http://localhost:5000/post", data);
      console.log(response.data)
      dispatch(addData(response.data));
    } catch (err) {
      console.log(err);
    }
  };
};

// 삭제하기
export const removeDataDB = (id) => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`http://localhost:5000/post/${id}`);
      dispatch(removeData(id)); 
    } catch (err) {
      console.log(err);
    }
  }
}

//수정하기
export const modifyDataDB = (id, data) => {
  return async (dispatch) => {
    try {
      const response = await axios.patch(`http://localhost:5000/post/${id}`, data);
      dispatch(modifyData({id, data}));
    } catch (err) {
      console.log(err);
    }
  }
}

//Reducer
const postSlice = createSlice({
  name: "post",
  initialState: {
    list: []
  },
  reducers: {
    //read
    setData: (state, action) => {
      state.list = action.payload;
    },
    // 추가하기
    addData: (state, action) => {
      state.list.push(action.payload);
    },
    // 삭제하기 
    removeData: (state, action) => {
      state.list = state.list.filter(
        (post) => {
          if (post.id === action.payload) { // 받아온 id와 저장되어 있는 데이터의 id가 같으면 
            // action.payload => id
            return false;
          } else {
            return true;
          }
        }
      )
    },
    //수정하기
    modifyData: (state, action) => {
      state.list = state.list.map(
        (post) => {
          if (post.id === action.payload.id) { // 받아온 id와 저장되어 있는 데이터의 id가 같으면 
            return {
              ...post, 
              subject: action.payload.data.subject,
              content: action.payload.data.content
            }
          } else {
            return post;
          }
        }
      );
    }
  },
});

export const { setData, addData, removeData, modifyData } = postSlice.actions;
export default postSlice.reducer;
