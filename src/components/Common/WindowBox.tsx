import React, { FunctionComponent } from "react";
import { graphql, Link } from "gatsby";
import styled from "@emotion/styled";
import ContentItem from "./ContentItem";

const Window = styled.div`
  position: fixed;
  display: flex;
  box-shadow: 0 22px 70px 4px rgba(0, 0, 0, 0.56);
  z-index: 1;
  overflow: hiddeen;

  height: 60vh;
  width: 80%;
  top: 45%;
  left: 50%;
  max-width: 1000px;
  max-height: 650px;
  transform: translate(-50%, -50%);

  color: black;
  font-weight: bold;
  border-radius: 15px;

  @media screen and (max-width: 767.9px) {
    margin: 10px auto;
    border-radius: 12px;
  }

  @media screen and (max-width: 576px) {
    flex-direction: row;
  }
`;
const WindowHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4rem;
  z-index: 2;
  padding-left: 1rem;
  padding-top: 1rem;

  div {
    display: flex;

    .color-button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 7px;
      cursor: pointer;
    }

    .red {
      background-color: #fc5959;
      border: 0.5px solid #e94b4d;
    }

    .yellow {
      background-color: #fcbd29;
      border: 0.5px solid #f6ba2b;
    }

    .green {
      background-color: #36d141;
      border: 0.5px solid #32c438;
    }
  }
`;

const WindowSide = styled.div`
  background-color: #ffffff80;
  float: none;
  max-height: none;
  max-width: 230px;
  overflow-y: auto !important;
  width: 80%;
  background-color: rgba(239, 242, 245, 0.75);
  backdrop-filter: blur(16px);
  padding-left: 1rem;
  padding-right: 1rem;
  overflow-x: auto;
  height: 100%;
  padding-top: 4.5rem;
  white-space: nowrap;

  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;

  @media (max-width: 768px) {
    width: 40%;
  }
`;

const WindowContent = styled.div`
  float: none;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  background-color: #eff2f5;
  padding: 1rem;
  padding-top: 0;

  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
`;

const WindowBox: FunctionComponent<{
  title: string;
  projects: any;
  func: any;
}> = function ({ title, projects, func }) {
  return (
    <Window>
      <WindowHeader className="window_header">
        <div>
          <div className="color-button red" onClick={func}></div>
          <div className="color-button yellow" onClick={func}></div>
          <Link className="color-button green" to="/finder"></Link>
        </div>
      </WindowHeader>
      <WindowSide className="window_side">{title}</WindowSide>
      <WindowContent className="window_content">
        <ContentItem contents={projects} />
      </WindowContent>
    </Window>
  );
};

export default WindowBox;
