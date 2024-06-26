import { useEffect, useRef, useState } from 'react';
import TradeModal from './modal/TradeModal';
import SettingModal from './modal/SettingModal';
import { useDispatch, useSelector } from 'react-redux';
import CircularTimer from './section/CircularTimer';
import MyPageModal from './modal/MyPageModal';
import NewsModal from './modal/NewsModal';
// import LottieRain from './lottie-animation/LottieRain';
import { logout } from '../api/auth';
import { httpStatusCode } from '../util/http-status';
import Stomp from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';

import InventoryModal from './modal/InventoryModal';
import InfraModal from './modal/InfraModal';

import {
    Article,
    FinalReportType,
    HalfReportType,
    InitialData,
    OfflineReportType,
    QuarterReportType,
    SpecialEvent,
    ViewSpecialEvent,
} from '../type/types';
import { themeModeState } from '../util/counter-slice';
import { withdrawal } from '../api/user';
import WarningModal from './modal/WarningModal';
import ChattingModal from './modal/ChattingModal';
import WebSocket from './modal/WebSocket';
import QuarterReportModal from './modal/QuarterReportModal';
import { Cookies } from 'react-cookie';
import HalfReportModal from './modal/HalfReportModal';
import OffReportModal from './modal/OffReportModal';

import { loadEventImg } from '../util/loadEventImg';
import { loadProduct } from '../util/loadProduct';
import { useNavigate } from 'react-router-dom';
import logoutServiceWorker from '../util/logoutServiceWorker';
import FinReportModal from './modal/FinReportModal';
import BreakTimePage from './page-component/BreakTimePage';
import { myProductState, overdueMethod } from '../util/myproduct-slice';

type GameType = {
    initialData: InitialData;
    setStartFlag: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function GameComponent(props: GameType) {
    const initialData = props.initialData;
    const [tradeFlag, setTradeFlag] = useState<boolean>(false);
    const [facilityFlag, setFacilityFlag] = useState<boolean>(false);
    const [settingFlag, setSettingFlag] = useState<boolean>(false);
    const [mypageFlag, setMyPageFlag] = useState<boolean>(false);
    const [newsFlag, setNewsFlag] = useState<boolean>(false);
    const [inventoryFlag, setInventoryFlag] = useState<boolean>(false);
    //턴 시간
    const [duration, setDuration] = useState<number>(
        import.meta.env.VITE_TURN_PERIOD_SEC
    );
    const [ingameTurn, setIngameTurn] = useState<number>(1);
    const [ingameTime, setIngameTime] = useState<string>('00:03:00');
    const [turnStartTime, setTurnStartTime] = useState<number>(0);
    const [gameYear, setGameYear] = useState<number>(0);
    const [gameMonth, setGameMonth] = useState<number>(3);
    const [gameDay, setGameDay] = useState<number>(1);
    const [seasonImg, setSeasonImg] = useState<string>('spring');

    const [playing, setPlaying] = useState<boolean>(false);
    const [audio, setAudio] = useState(
        new Audio('/src/assets/bgm/main_theme_bgm.mp3')
    );
    const [theme, setTheme] = useState<string>();
    const [turnTimer, setTurnTimer] = useState<number>(-1);
    const [nowMoney, setNowMoney] = useState<number>(0);

    //뉴스 관련
    const [showNews, setShowNews] = useState<boolean>(false);
    const [newsPublishTurn, setNewsPublishTurn] = useState<number>(0);
    const [newsArticleList, setNewsArticleList] = useState<Article[]>([]);

    ///이벤트 관련
    const [currentSpecialEvent, setCurrentSpecialEvent] = useState<
        ViewSpecialEvent[]
    >([]);
    const [currentViewEvent, setCurrentViewEvent] = useState<SpecialEvent[]>(
        []
    );
    //이벤트 관련

    const [isLogoutProceeding, setIsLogoutProceeding] =
        useState<boolean>(false);

    const [isWithdrawalProceeding, setIsWithdrawalProceeding] =
        useState<boolean>(false);

    const [webSocketClient, setWebSocketClient] = useState<Stomp.Client>(
        new Client()
    );

    const [webSocketId, setWebSocketId] = useState<string>('');

    /**결산 모달 관련 useState */
    const [isQtrReportAvail, setIsQtrReportAvail] = useState<boolean>(false); //분기
    const [isHlfReportAvail, setIsHlfReportAvail] = useState<boolean>(false); //반기
    const [isFinReportAvail, setIsFinReportAvail] = useState<boolean>(false); //전체
    const [isOffReportAvail, setIsOffReportAvail] = useState<boolean>(false); //미접

    const [qtrReport, setQtrReport] = useState<QuarterReportType | null>(null); //분기
    const [hlfReport, setHlfReport] = useState<HalfReportType | null>(null); //반기
    const [finReport, setFinReport] = useState<FinalReportType | null>(null); //전체
    const [offReport, setOffReport] = useState<OfflineReportType | null>(null); //미접

    //에러 시 알림 창
    const AlertRef = useRef<HTMLDivElement>(null);
    const [alertMessage, setAlertMessage] = useState<string>('');

    //게임 나가기 관련
    const [isGetoutProceeding, setIsGetoutProceeding] =
        useState<boolean>(false);

    //지금은 브레이크 타임인가?
    const [isBreakTime, setIsBreakTime] = useState<boolean>(false);

    //timer setting
    const [breakTime, setBreakTime] = useState<string>('');
    const [timerStartTime, setTimerStartTime] = useState<string>('');

    const articleBoxRef = useRef<HTMLParagraphElement>(null);
    const [nowArticle, setNowArticle] = useState<string>('');
    const nowArticleIdx = useRef<number>(0);

    //신문이 왼쪽으로 흘러간다
    //새 뉴스 오면 초기화
    useEffect(() => {
        if (articleBoxRef.current) {
            articleBoxRef.current.style.animation = '';
            nowArticleIdx.current = 0;
            articleFlowLeft();
        }
    }, [newsArticleList]);

    //애니메이션 끝날 때마다 반복 실행
    useEffect(() => {
        if (articleBoxRef.current) {
            articleFlowLeft();
        }
    }, [nowArticleIdx.current]);

    /** articleFlowLeft()
     *  왼쪽으로 흘러가는 aritcle
     */
    const articleFlowLeft = () => {
        if (articleBoxRef.current) {
            const idx = nowArticleIdx.current;
            if (idx < newsArticleList.length) {
                setNowArticle(newsArticleList[idx].articleHeadline);
                articleBoxRef.current.style.animation =
                    'article-list 5s 0s 1 linear';
                articleBoxRef.current.onanimationend = () => {
                    if (articleBoxRef.current) {
                        articleBoxRef.current.style.animation = '';
                        nowArticleIdx.current++;
                        if (nowArticleIdx.current >= newsArticleList.length) {
                            nowArticleIdx.current = 0;
                        }
                    }
                };
            }
        }
    };

    const startTimer = (ingameTime: string, breakTime: string) => {
        setBreakTime(breakTime);
        setTimerStartTime(ingameTime);
        setIsBreakTime(true);
    };

    const endTimer = () => {
        setIsBreakTime(false);
    };

    let navigate = useNavigate();

    /**결산이 들어오면? */
    const reportReceived = (type: string, body: any) => {
        if (type === 'QUARTER_REPORT') {
            setIsQtrReportAvail(true);
            setQtrReport(body);
            //압수품 관련
            if (body.rentFeeInfo.billType === 'overdue') {
                //압수품 dispatch
                dispatch(overdueMethod(body.rentFeeInfo.productList));
            } else if (body.rentFeeInfo.billType === 'bankrupt') {
                //내 소유물 초기화
                myProductState([]);
            }
        } else if (type === 'HALF_REPORT') {
            setIsHlfReportAvail(true);
            setHlfReport(body);
            //압수품 관련
            if (body.rentFeeInfo.billType === 'overdue') {
                //압수품 dispatch
                dispatch(overdueMethod(body.rentFeeInfo.productList));
            } else if (body.rentFeeInfo.billType === 'bankrupt') {
                //내 소유물 초기화
                myProductState([]);
            }
        } else if (type === 'FINAL_REPORT') {
            setIsFinReportAvail(true);
            setFinReport(body);
        } else if (type === 'OFFLINE_REPORT') {
            setIsOffReportAvail(true);
            setOffReport(body);
            //압수품 관련
            if (body.rentFeeInfo.billType === 'overdue') {
                //압수품 dispatch
                dispatch(overdueMethod(body.rentFeeInfo.productList));
            } else if (body.rentFeeInfo.billType === 'bankrupt') {
                //내 소유물 초기화
                myProductState([]);
            }
        }
    };

    /** handleGetOut()
     *  게임에서 나간다. 웹 소켓 닫고 메인 화면으로 이동
     */
    const handleGetOut = async () => {
        //websocket보내기
        const quitMsg = JSON.stringify({
            type: 'QUIT_GAME',
            body: {},
        });
        if (webSocketClient.connected) {
            webSocketClient.publish({
                destination: `/app/private/${webSocketId}`,
                body: quitMsg,
            });

            webSocketClient.deactivate();
        }
        //나가기
        props.setStartFlag(false);
    };

    /** handleLogOut()
     *  로그아웃
     */
    const handleLogOut = async () => {
        //websocket보내기
        const quitMsg = JSON.stringify({
            type: 'QUIT_GAME',
            body: {},
        });
        if (webSocketClient.connected) {
            webSocketClient.publish({
                destination: `/app/private/${webSocketId}`,
                body: quitMsg,
            });

            webSocketClient.deactivate();
        }

        const res = await logout();
        if (res.status === httpStatusCode.OK) {
            logoutServiceWorker();
            setIsLogoutProceeding(false);

            // navigate('/');
            props.setStartFlag(false);
            window.location.reload();
        } else {
            // console.log('Logout error');
        }
    };

    /** proceedLogout()
     * 로그아웃 모달 활성화 */
    const proceedLogout = () => {
        setIsLogoutProceeding(true);
    };

    /** handleCloseErrorModal()
     * 로그아웃 모달 비활성화 */
    const handleCloseErrorModal = () => {
        setIsLogoutProceeding(false);
    };

    const handleGetOutModal = () => {
        setIsGetoutProceeding(false);
    };

    /** handleWithdrawal()
     *  회원 탈퇴를 진행한다.
     */
    const handleWithdrawal = async () => {
        const res = await withdrawal();
        if (res.status === httpStatusCode.OK) {
            logoutServiceWorker();
            props.setStartFlag(false);
            setIsWithdrawalProceeding(false);
            window.location.reload();
        } else {
            // console.log('회원 탈퇴 불가');
        }
    };

    /** proceedWithdrawal()
     *  회원 탈퇴 모달을 띄운다.
     */
    const proceedWithdrawal = () => {
        setIsWithdrawalProceeding(true);
    };

    /** cancelWithdrawal()
     *  회원 탈퇴 진행을 취소한다.
     */
    const cancelWithdrawal = () => {
        setIsWithdrawalProceeding(false);
    };

    //칭호 정보 불러오기
    const titleInfo = initialData.titleList;

    //게임 설정 정보 불러오기
    const bgmSetting = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.bgmFlag
    );
    const themeSetting = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.themeType
    );
    const themeModeSetting = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.themeMode
    );
    const profileTheme = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.profileTheme
    );
    const profileIcon = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.profileIcon
    );
    const profileFrame = useSelector(
        (state: any) => state.reduxFlag.reduxSlice.profileFrame
    );

    //게임 초기 정보 불러오기
    const goldNumber = useSelector(
        (state: any) => state.reduxFlag.myProductSlice.gold
    );

    const userNickname = useSelector(
        (state: any) => state.reduxFlag.myProfileSlice.userNickname
    );

    const titleId = useSelector(
        (state: any) => state.reduxFlag.myProfileSlice.title
    );

    //퍼블릭 이벤트 나중에 리덕스에서 인자 주는걸로 바꾸기
    const publicEvent = useSelector(
        (state: any) => state.reduxFlag.productAndEventSlice.specialEventId
    );

    /** 테마모드변경 */
    const changeMode = (prop: number) => {
        dispatch(themeModeState(prop));
    };

    const dispatch = useDispatch();

    const cookies = new Cookies();
    useEffect(() => {
        if (!cookies.get('accessToken')) {
            // console.log('토큰 만료!!!');
            props.setStartFlag(false);
        }
    }, [cookies]);

    //init
    useEffect(() => {
        // console.log(ingameTurn % 360);
        if (ingameTurn % 360 > 0 && ingameTurn % 360 < 91) {
            setSeasonImg('spring');
        } else if (ingameTurn % 360 > 90 || ingameTurn % 360 < 181) {
            setSeasonImg('summer');
        } else if (ingameTurn % 360 > 180 && ingameTurn % 360 < 271) {
            setSeasonImg('fall');
        } else if (ingameTurn % 360 > 270 || ingameTurn % 360 === 0) {
            setSeasonImg('winter');
        }
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue =
                '변경사항이 저장되지 않을 수 있습니다. 페이지를 떠나시겠습니까?';
        };
        // 이벤트 리스너 추가
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // 인게임 시간 설정
    useEffect(() => {
        // console.log(ingameTurn % 360);
        if (ingameTurn % 360 > 0 && ingameTurn % 360 < 91) {
            setSeasonImg('spring');
        } else if (ingameTurn % 360 > 90 && ingameTurn % 360 < 181) {
            setSeasonImg('summer');
        } else if (ingameTurn % 360 > 180 && ingameTurn % 360 < 271) {
            setSeasonImg('fall');
        } else if (ingameTurn % 360 > 270 || ingameTurn % 360 === 0) {
            setSeasonImg('winter');
        }
        const date = ingameTurn - 1;
        setGameDay((date % 30) + 1);
        setGameMonth(((Math.floor(date / 30) + 2) % 12) + 1);
        setGameYear(Math.floor((date + 60) / 360));
    }, [ingameTurn]);

    // 테마 설정
    useEffect(() => {
        if (themeSetting === 'auto') {
            if (turnTimer <= duration && turnTimer > duration / 2) {
                setTheme('morning');
            } else if (turnTimer <= duration / 2 && turnTimer > duration / 4) {
                setTheme('evening');
            } else if (turnTimer <= duration / 4 && turnTimer > 0) {
                setTheme('night');
            } else {
                setTheme('morning');
            }
        } else {
            setTheme(themeSetting);
        }
    }, [themeSetting, turnTimer]);
    // BGM 설정
    useEffect(() => {
        setPlaying(bgmSetting);
    }, [playing, bgmSetting]);
    useEffect(() => {
        playing ? audio.play() : audio.pause();
    }, [playing, audio]);
    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, [audio]);

    useEffect(() => {
        // json 넣어야함
        const randomNum: string[] = [];
        for (let index = 0; index < 5; index++) {
            const element = Math.floor(Math.random() * 17) + 1;
            randomNum.push(element + '');
        }
        //여기서 이벤트의 목록들이 생김
        // dispatch(specialEventState(randomNum));
        //specialEvent에 [1,3,6 이런식으로 생김]
        //json에서 evendId가 1,3,6인것을 받아양함
        // console.log(publicEvent);
        if (publicEvent) {
            // console.log('보여줍니다 콘솔');
            // console.log(publicEvent);
            const newPublicEvent = initialData.eventList.filter((event) =>
                publicEvent.includes(event.eventId)
            );

            const pushData: ViewSpecialEvent[] = [
                { eventName: '폭우', eventArray: [] },
                { eventName: '폭염', eventArray: [] },
                { eventName: '폭설', eventArray: [] },
                { eventName: '한파', eventArray: [] },
                { eventName: '가뭄', eventArray: [] },
                { eventName: '우박', eventArray: [] },
                { eventName: '풍작', eventArray: [] },
                { eventName: '흉작', eventArray: [] },
                { eventName: '사회 이슈', eventArray: [] },
            ];
            newPublicEvent.map((item) => {
                const targetData = pushData.find(
                    (pd) => pd.eventName === item.eventName
                );
                if (targetData) {
                    targetData.eventArray.push(item);
                }
            });

            //가뭄, 흉작, 풍작, 풍작, 풍작
            //가뭄, 흉작, 풍작

            // console.log(pushData);
            setCurrentSpecialEvent(pushData);
        }
    }, [publicEvent]);

    const openTradeElement = () => {
        setTradeFlag(true);
        setMyPageFlag(false);
        setFacilityFlag(false);
        setShowNews(false);
        setInventoryFlag(false);
    };
    const openFacilityElement = () => {
        setFacilityFlag(true);
        setMyPageFlag(false);
        setTradeFlag(false);
        setShowNews(false);
        setInventoryFlag(false);
    };
    const openNewsElement = () => {
        setFacilityFlag(false);
        setTradeFlag(false);
        setMyPageFlag(false);
        setInventoryFlag(false);
        setShowNews(true);
        setNewsFlag(false);
    };
    const openSettingElement = () => {
        setTradeFlag(false);
        setFacilityFlag(false);
        setShowNews(false);
        setMyPageFlag(false);
        setSettingFlag(true);
        setInventoryFlag(false);
    };
    const openMypageElement = () => {
        setTradeFlag(false);
        setFacilityFlag(false);
        setShowNews(false);
        setMyPageFlag(true);
        setInventoryFlag(false);
    };

    const openInventoryElement = () => {
        setInventoryFlag(true);
        setTradeFlag(false);
        setFacilityFlag(false);
        setShowNews(false);
        setMyPageFlag(false);
    };

    //gold update시 반영
    useEffect(() => {
        //애니메이션 트리거
        updateNowMoney(goldNumber);
    }, [goldNumber]);
    /**updateNowMoney(value)
     * 현재 nowMoney값을 value만큼 업데이트
     */
    const updateNowMoney = (value: number) => {
        // 돈 변화 애니메이션
        let originMoney = nowMoney;
        const num = value;
        let moneylength = 0;
        // 빼기면
        moneylength = Math.abs(originMoney - num).toString().length;

        let count = 0;

        if (moneylength == 1) {
            count = 1;
        } else {
            for (let i = 1; i <= moneylength - 1; i++) {
                count = count * 10 + (i % 10);
            }
        }

        // 빼기면
        if (originMoney > num) {
            const counting = setInterval(function () {
                originMoney - count;
                if (originMoney <= num) {
                    originMoney = num;
                    setNowMoney(originMoney);
                    clearInterval(counting);
                } else {
                    originMoney = originMoney - count;
                    setNowMoney(originMoney);
                }
            }, 20);
        } else if (originMoney < num) {
            const counting = setInterval(function () {
                originMoney - count;
                if (originMoney >= num) {
                    originMoney = num;
                    setNowMoney(originMoney);
                    clearInterval(counting);
                } else {
                    originMoney = originMoney + count;
                    setNowMoney(originMoney);
                }
            }, 20);
        }
        // 돈 변화 애니메이션
    };

    /** 현재 이벤트를 보여주기 위한 btn  */
    const viewPubEventDetail = (prop: SpecialEvent[]) => {
        setCurrentViewEvent(prop);
    };
    /** 현재 이벤트를 보여주는 Element */
    const currentViewElement = () => {
        return (
            <>
                <div
                    className="w-full h-full absolute top-0 left-0 z-40 opacity-0"
                    onClick={() => {
                        setCurrentViewEvent([]);
                    }}
                ></div>
                <div className="absolute w-[60%] h-[60%]  flex flex-col items-center overflow-y-auto z-50">
                    <img
                        src="/src/assets/images/layout/ui-board.webp"
                        className="absolute w-full h-full -z-10"
                        alt=""
                    />
                    {currentViewEvent.length > 0 ? (
                        <div className="w-full text-center color-text-textcolor text-[3vw] mt-[2vw]">
                            {currentViewEvent[0].eventName}
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className="relative w-[90%] h-full flex flex-col items-center overflow-y-auto color-text-textcolor px-[2vw] mb-[2.4vw]">
                        {currentViewEvent.map((item, index) => {
                            return (
                                <div
                                    className="relative w-full flex items-center justify-center my-[0.4vw] bg-white border-[0.4vw] color-border-subbold py-[1vw] rounded-[1vw]"
                                    key={'event key : ' + index}
                                >
                                    <div className="w-[15%]">
                                        <div
                                            className={
                                                'bg-no-repeat mx-auto sprite-img-crop ' +
                                                `crop-img-${item.productId}`
                                            }
                                            style={{
                                                aspectRatio: 1 / 1,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="w-[85%] ms-[2vw] text-start flex flex-col justify-start overflow-y-auto">
                                        <p className="text-[1.6vw] pe-[2vw]">
                                            {item.eventHeadline}
                                        </p>
                                        <p className="text-[1vw] my-[1vw] pe-[2vw]">
                                            {item.eventContent}
                                        </p>
                                        <div className="flex items-center text-[1.6vw]">
                                            <p>
                                                {loadProduct(
                                                    item.productId,
                                                    initialData.productList
                                                )}
                                            </p>
                                            {item.eventVariance >= 0 ? (
                                                <p className=" mx-[2vw] text-green-400">
                                                    +{item.eventVariance}%
                                                </p>
                                            ) : (
                                                <p className=" mx-[2vw] text-red-400">
                                                    {item.eventVariance}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        className="absolute text-[2vw] flex items-center justify-center text-white top-[2.2vw] right-[3vw] w-[4vw] h-[4vw] border-[0.4vw] color-border-sublight color-bg-orange1 rounded-full cursor-pointer btn-animation"
                        onClick={() => {
                            setCurrentViewEvent([]);
                        }}
                    >
                        X
                    </div>
                </div>
            </>
        );
    };

    /**경고가 뜨면 경고를 보여주는 함수 */
    const alertError = (message: string) => {
        setAlertMessage(message);
        if (AlertRef.current) {
            //애니메이션 적용
            AlertRef.current.style.animation =
                'alert-error 3s 0s 1 ease-in-out';
            //끝나면 초기화
            AlertRef.current.onanimationend = () => {
                if (AlertRef.current) {
                    AlertRef.current.style.animation = '';
                }
            };
        }
    };

    return (
        <section className="mainBackground relative w-full h-full flex flex-col justify-center items-center">
            {isBreakTime ? (
                <>
                    <BreakTimePage
                        webSocketClient={webSocketClient}
                        alertError={alertError}
                        setStartFlag={props.setStartFlag}
                        webSocketId={webSocketId}
                        proceedLogout={proceedLogout}
                        proceedWithdrawal={proceedWithdrawal}
                        breakTime={breakTime}
                        timerStartTime={timerStartTime}
                    />
                    {isLogoutProceeding ? (
                        <WarningModal
                            handleOK={handleLogOut}
                            handleCancel={handleCloseErrorModal}
                            message="로그아웃 하시겠습니까?"
                            cancelMessage="취소"
                            okMessage="로그아웃"
                        />
                    ) : (
                        <></>
                    )}
                    {isWithdrawalProceeding ? (
                        <WarningModal
                            handleOK={handleWithdrawal}
                            handleCancel={cancelWithdrawal}
                            message="정말로 회원탈퇴 하시겠습니까?"
                            cancelMessage="취소"
                            okMessage="회원탈퇴"
                        />
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <>
                    {/* 알림 메시지 */}
                    <div
                        className="absolute w-[40%] h-[10%] left-[30%] top-[40%] bg-black -z-10 rounded text-white opacity-0 flex justify-center items-center whitespace-pre-wrap"
                        ref={AlertRef}
                    >
                        <p className="text-[1.5vw]">{alertMessage}</p>
                    </div>
                    {/* 기사 표시 화면 */}
                    <div className="w-[40%] h-[10%] absolute left-[30%] top-[2%] bg-black overflow-hidden flex items-center">
                        <p
                            className="absolute w-full text-white text-[2vw] left-[100%] overflow-visible whitespace-nowrap z-20"
                            ref={articleBoxRef}
                        >
                            {nowArticle}
                        </p>
                    </div>

                    {isGetoutProceeding ? (
                        <WarningModal
                            handleOK={handleGetOut}
                            handleCancel={handleGetOutModal}
                            message="메인화면으로 돌아가시겠습니까?"
                            cancelMessage="취소"
                            okMessage="나가기"
                        />
                    ) : (
                        <></>
                    )}
                    {isLogoutProceeding ? (
                        <WarningModal
                            handleOK={handleLogOut}
                            handleCancel={handleCloseErrorModal}
                            message="로그아웃 하시겠습니까?"
                            cancelMessage="취소"
                            okMessage="로그아웃"
                        />
                    ) : (
                        <></>
                    )}
                    {isWithdrawalProceeding ? (
                        <WarningModal
                            handleOK={handleWithdrawal}
                            handleCancel={cancelWithdrawal}
                            message="정말로 회원탈퇴 하시겠습니까?"
                            cancelMessage="취소"
                            okMessage="회원탈퇴"
                        />
                    ) : (
                        <></>
                    )}
                    <img
                        src={`/src/assets/images/background/bg-${profileTheme}-morning.webp`}
                        className="bg-image -z-20"
                        style={{
                            opacity: theme === 'morning' ? '1' : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/background/bg-${profileTheme}-evening.webp`}
                        className="bg-image -z-20"
                        style={{
                            opacity: theme === 'evening' ? '1' : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/background/bg-${profileTheme}-night.webp`}
                        className="bg-image -z-20"
                        style={{
                            opacity: theme === 'night' ? '1' : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/background/bg-${profileTheme}-morning.webp`}
                        className="bg-image -z-30"
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-ts-${themeModeSetting}-morning.webp`}
                        className="bg-image -z-10"
                        style={{
                            opacity:
                                theme === 'morning' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-${profileTheme}-morning-transparent.webp`}
                        className="bg-image"
                        style={{
                            opacity:
                                theme === 'morning' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-ts-${themeModeSetting}-evening.webp`}
                        className="bg-image -z-10"
                        style={{
                            opacity:
                                theme === 'evening' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-${profileTheme}-evening-transparent.webp`}
                        className="bg-image"
                        style={{
                            opacity:
                                theme === 'evening' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-ts-${themeModeSetting}-night.webp`}
                        className="bg-image -z-10"
                        style={{
                            opacity:
                                theme === 'night' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-${profileTheme}-night-transparent.webp`}
                        className="bg-image"
                        style={{
                            opacity:
                                theme === 'night' && themeModeSetting !== 0
                                    ? '1'
                                    : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-ts-${themeModeSetting}-morning.webp`}
                        className="bg-image -z-20"
                        style={{
                            opacity: themeModeSetting !== 0 ? '1' : '0',
                        }}
                    />
                    <img
                        src={`/src/assets/images/backgroundts/bg-${profileTheme}-morning-transparent.webp`}
                        className="bg-image -z-10"
                        style={{
                            opacity: themeModeSetting !== 0 ? '1' : '0',
                        }}
                    />

                    <div className="absolute top-0 w-[60%] h-[100%]">
                        {/* <LottieRain /> */}
                    </div>

                    {/* 좌측 상단 ui */}
                    <div className="absolute w-[22%] h-[16%] top-[4%] left-[2%]">
                        <img
                            src="/src/assets/images/layout/ui-board.webp"
                            className="absolute w-full h-full z-20"
                            alt=""
                        />
                        <div className="relative w-full h-full flex items-center justify-center rounded-[0.4vw] cursor-pointer z-20">
                            <div
                                className="relative w-full h-full flex "
                                onClick={() => openMypageElement()}
                            >
                                <div
                                    className="relative  m-0"
                                    style={{ aspectRatio: 1 / 1 }}
                                >
                                    <img
                                        className="absolute h-full cursor-pointer p-[0.6vw] object-cover"
                                        src={`/src/assets/images/profile/icon (${profileIcon}).png`}
                                    />
                                    {profileFrame !== 1 ? (
                                        <img
                                            className="absolute h-full cursor-pointer btn-animation p-[0.6vw] object-cover"
                                            src={`/src/assets/images/profile/frame (${profileFrame}).png`}
                                        />
                                    ) : (
                                        <div className="absolute h-full cursor-pointer btn-animation p-[0.6vw] object-cover" />
                                    )}
                                </div>

                                <div className="relative w-[65%] flex flex-col items-center justify-center ps-[1%]">
                                    {titleInfo.length > 0 && titleId === 1 ? (
                                        <></>
                                    ) : (
                                        <p className="w-full text-start text-[1.4vw] color-text-sublight whitespace-nowrap overflow-hidden text-ellipsis">
                                            {titleInfo[titleId - 1].titleName}
                                        </p>
                                    )}
                                    <p className="w-full text-start my-[2%] text-[1.5vw] color-text-textcolor whitespace-nowrap overflow-hidden text-ellipsis">
                                        {userNickname}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            <div
                                className="relative m-[0.4vw] w-[18%] h-full bg-red-50 aspect-square cursor-pointer btn-animation rounded-full border-[0.2vw]"
                                onClick={() => {
                                    changeMode(0);
                                }}
                            >
                                <img
                                    className="rounded-full"
                                    src="/src/assets/images/etc/ui-ts-door-1.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className="relative m-[0.4vw] w-[18%] h-full bg-red-50 aspect-square cursor-pointer btn-animation rounded-full border-[0.2vw]"
                                onClick={() => {
                                    changeMode(1);
                                }}
                            >
                                <img
                                    className="rounded-full"
                                    src="/src/assets/images/etc/ui-ts-door-2.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className="relative m-[0.4vw] w-[18%] h-full bg-red-50 aspect-square cursor-pointer btn-animation rounded-full border-[0.2vw]"
                                onClick={() => {
                                    changeMode(2);
                                }}
                            >
                                <img
                                    className="rounded-full"
                                    src="/src/assets/images/etc/ui-ts-door-3.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className="relative m-[0.4vw] w-[18%] h-full bg-red-50 aspect-square cursor-pointer btn-animation rounded-full border-[0.2vw]"
                                onClick={() => {
                                    changeMode(3);
                                }}
                            >
                                <img
                                    className="rounded-full"
                                    src="/src/assets/images/etc/ui-ts-door-4.webp"
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* 우측 상단 ui */}
                    <div className="absolute w-[25%] h-[14%] top-[4%] right-[2%] flex flex-col items-end">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="relative w-[65%] h-full flex flex-col items-center justify-around rounded-[1vw] color-text-textcolor left-[2vw] z-20">
                                <img
                                    src="/src/assets/images/layout/ui-board.webp"
                                    className="absolute w-full h-full -z-10"
                                    alt=""
                                />
                                <p className="text-[1.4vw]">
                                    {gameYear}년 {gameMonth}월 {gameDay}일
                                </p>
                                <div className="flex items-center justify-start">
                                    <img
                                        className="absolute left-0 mx-[1vw] w-[12%]"
                                        src="/src/assets/images/icon/ui-icon-coin.png"
                                        alt=""
                                    />
                                    <p className="text-[1.4vw]">
                                        {nowMoney.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div
                                className="relative w-[35%] flex items-center justify-center rounded-full border-[0.4vw] color-border-subbold z-20"
                                style={{ aspectRatio: 1 / 1 }}
                            >
                                <CircularTimer
                                    duration={duration}
                                    ingameTime={ingameTime}
                                    setTurnTimer={setTurnTimer}
                                    turnStartTime={turnStartTime}
                                />
                                <div className="absolute w-full h-full rounded-full border-[0.4vw] border-white flex items-center justify-center">
                                    <div
                                        className="absolute w-full h-full"
                                        style={{
                                            backgroundImage:
                                                'url(/src/assets/images/icon/ui-icon-timeCircle.png)',
                                            backgroundSize: 'contain ',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }}
                                    ></div>
                                    <div
                                        className="absolute w-[60%] h-[60%] z-20 bg-no-repeat bg-center"
                                        style={{
                                            backgroundImage: `url(/src/assets/images/icon/ui-season-${seasonImg}.png)`,
                                            backgroundSize: 'contain ',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex py-[2vw]">
                            {currentSpecialEvent.map((item) => {
                                if (item.eventArray.length > 0) {
                                    return (
                                        <div
                                            className="relative px-[0.4vw] cursor-pointer btn-animation"
                                            onClick={() => {
                                                viewPubEventDetail(
                                                    item.eventArray
                                                );
                                            }}
                                        >
                                            <img
                                                className=" w-[4.8vw] bg-white rounded-full border-[0.2vw] border-white"
                                                style={{ aspectRatio: 1 / 1 }}
                                                src={loadEventImg(
                                                    item.eventName
                                                )}
                                                alt=""
                                            />
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>

                    {/* 좌측 하단 ui */}
                    <div className="absolute w-[40%] h-[20%] bottom-[4%] left-[1%]">
                        <div className="relative w-full h-full flex items-center justify-start">
                            <div
                                className="w-[19%] h-[100%] cursor-pointer btn-animation"
                                onClick={() => {
                                    openTradeElement();
                                }}
                            >
                                <img
                                    className="w-full"
                                    src="/src/assets/images/icon/ui-icon-trade.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-trade-text.webp"
                                    alt=""
                                />
                            </div>

                            <div
                                className="w-[19%] h-[100%] cursor-pointer btn-animation"
                                onClick={() => {
                                    openFacilityElement();
                                }}
                            >
                                <img
                                    className="w-full"
                                    src="/src/assets/images/icon/ui-icon-facility.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-facility-text.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className="w-[19%] h-[100%] cursor-pointer btn-animation"
                                onClick={() => {
                                    openInventoryElement();
                                }}
                            >
                                <img
                                    className="w-full"
                                    src="/src/assets/images/icon/ui-icon-inventory.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-inventory-text.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className={`relative w-[19%] h-[100%] cursor-pointer btn-animation `}
                                onClick={() => {
                                    openNewsElement();
                                }}
                            >
                                <img
                                    className={`w-full ${
                                        newsFlag
                                            ? 'border-red-500 border-[0.2vw] rounded-[0.6vw] bg-white'
                                            : ''
                                    }`}
                                    src="/src/assets/images/icon/ui-icon-newspaper.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-newspaper-text.webp"
                                    alt=""
                                />
                                {newsFlag ? (
                                    <div className="absolute w-[100%] h-[16%] left-[0%] top-[-12%]  bg-red-500 text-white text-[1vw] rounded-[0.2vw]">
                                        새 신문 도착
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 우측 하단 ui */}
                    <div className="absolute w-[40%] h-[20%]  bottom-[4%] right-[1%]">
                        <div className="relative w-full h-full flex items-center justify-end">
                            <div
                                className="w-[19%] h-[100%] cursor-pointer btn-animation"
                                onClick={() => {
                                    openSettingElement();
                                }}
                            >
                                <img
                                    className="w-full"
                                    src="/src/assets/images/icon/ui-icon-setting.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-setting-text.webp"
                                    alt=""
                                />
                            </div>
                            <div
                                className="w-[19%] h-[100%] cursor-pointer btn-animation"
                                onClick={() => {
                                    setIsGetoutProceeding(true);
                                }}
                            >
                                <img
                                    className="w-full"
                                    src="/src/assets/images/icon/ui-icon-quit.webp"
                                    alt=""
                                    style={{ aspectRatio: 1 / 1 }}
                                />
                                <img
                                    src="/src/assets/images/icon/ui-icon-quit-text.webp"
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>

                    {tradeFlag ? (
                        <TradeModal
                            setTradeFlag={setTradeFlag}
                            updateNowMoney={updateNowMoney}
                            nowMoney={nowMoney}
                            infraInfo={initialData.infraList}
                            productResource={initialData.productList}
                            client={webSocketClient}
                            turn={ingameTurn}
                            webSocketId={webSocketId}
                        />
                    ) : (
                        <></>
                    )}
                    {facilityFlag ? (
                        <InfraModal
                            setFacilityFlag={setFacilityFlag}
                            updateNowMoney={updateNowMoney}
                            infraInfo={initialData.infraList}
                            client={webSocketClient}
                            webSocketId={webSocketId}
                            nowMoney={nowMoney}
                            alertError={alertError}
                        />
                    ) : (
                        <></>
                    )}
                    {settingFlag ? (
                        <SettingModal setSettingFlag={setSettingFlag} />
                    ) : (
                        <></>
                    )}
                    {mypageFlag ? (
                        <MyPageModal
                            setMypageFlag={setMyPageFlag}
                            titleInfo={initialData.titleList}
                            profileFrameInfo={initialData.profileFrameList}
                            themeInfo={initialData.themeList}
                            iconInfo={initialData.profileIconList}
                            achievementList={initialData.achievementList}
                            proceedLogout={proceedLogout}
                            proceedWithdrawal={proceedWithdrawal}
                        />
                    ) : (
                        <></>
                    )}
                    {showNews ? (
                        <NewsModal
                            newsPublishTurn={newsPublishTurn}
                            newsArticleList={newsArticleList}
                            newsFlag={newsFlag}
                            setShowNews={setShowNews}
                        />
                    ) : (
                        <></>
                    )}
                    {inventoryFlag ? (
                        <InventoryModal
                            setInventoryFlag={setInventoryFlag}
                            productSource={initialData.productList}
                            openTradeElement={openTradeElement}
                        />
                    ) : (
                        <></>
                    )}
                    <ChattingModal
                        client={webSocketClient}
                        alertError={alertError}
                        defaultMode={0}
                    />

                    {isQtrReportAvail && qtrReport ? (
                        <QuarterReportModal
                            titleList={initialData.titleList}
                            eventList={initialData.eventList}
                            productList={initialData.productList}
                            setIsQtrReportAvail={setIsQtrReportAvail}
                            webSocketId={webSocketId}
                            webSocketClient={webSocketClient}
                            qtrReport={qtrReport}
                            setStartFlag={props.setStartFlag}
                        />
                    ) : (
                        <></>
                    )}
                    {isHlfReportAvail && hlfReport ? (
                        <HalfReportModal
                            titleList={initialData.titleList}
                            eventList={initialData.eventList}
                            productList={initialData.productList}
                            setIsHlfReportAvail={setIsHlfReportAvail}
                            webSocketId={webSocketId}
                            webSocketClient={webSocketClient}
                            hlfReport={hlfReport}
                            setStartFlag={props.setStartFlag}
                            achievementInfo={initialData.achievementList}
                        />
                    ) : (
                        <></>
                    )}
                    {isFinReportAvail ? (
                        <FinReportModal
                            achievementInfo={initialData.achievementList}
                            productList={initialData.productList}
                            finReport={finReport}
                            setIsFinReportAvail={setIsFinReportAvail}
                        />
                    ) : (
                        <></>
                    )}

                    {isOffReportAvail && offReport ? (
                        <OffReportModal
                            offReport={offReport}
                            setIsOffReportAvail={setIsOffReportAvail}
                            nowTurn={ingameTurn}
                            productList={initialData.productList}
                            webSocketId={webSocketId}
                            webSocketClient={webSocketClient}
                            titleList={initialData.titleList}
                            eventList={initialData.eventList}
                            achievementInfo={initialData.achievementList}
                            setStartFlag={props.setStartFlag}
                        />
                    ) : (
                        <></>
                    )}
                    {/* 현재 이벤트 보여주기 */}
                    {currentViewEvent.length > 0 ? currentViewElement() : <></>}
                </>
            )}
            <WebSocket
                setWebSocketClient={setWebSocketClient}
                setWebSocketId={setWebSocketId}
                client={webSocketClient}
                webSocketId={webSocketId}
                setStartFlag={props.setStartFlag}
                reportReceived={reportReceived}
                setIngameTurn={setIngameTurn}
                setIngameTime={setIngameTime}
                setTurnStartTime={setTurnStartTime}
                setNewsPublishTurn={setNewsPublishTurn}
                setNewsArticleList={setNewsArticleList}
                setNewsFlag={setNewsFlag}
                startTimer={startTimer}
                endTimer={endTimer}
                alertError={alertError}
            />
        </section>
    );
}
