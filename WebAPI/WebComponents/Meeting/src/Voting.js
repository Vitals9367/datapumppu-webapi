
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react'
import SeatRow from './SeatRow'
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas" // DO NOT REMOVE THIS
import { agendaButtonStyle, headingStyle, linkStyle } from './styles';
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const chamberStyle = {
    fontSize: "65%",
    height: "50em",
    pageBreakInside: "avoid",
    backgroundColor: "#dedfe1",
    margin: 0,
    padding: 0
}

const voteListContainerStyle = {
    columnCount: 3,
    columnGap: "10px",
    boxSizing: "border-box",
    fontSize: "90%"
}
const miniChamberStyle = {
    height: "100px",
    width: "240px",
    pageBreakInside: "avoid",
    backgroundColor: "#dedfe1",
    margin: 0,
    padding: 0
}

const votingInfo = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%"
}

const voteLegend = {
    fontWeight: '600',
    width: '2em',
    padding:' 2px 2px 2px 2px',
    marginBottom: '4px',
    textAlign: 'center',
    boxSizing: 'border-box',
    backgroundColor: "#eeeeee",
    boxSizing: "border-box",
}

const voteCount = {
    paddingTop: "2px",
    paddingBottom: "2px",
    marginBottom: '4px',
    boxSizing: 'border-box',
}

const seatColorStyles = {
    redDeskStyle: {
        ...voteLegend,
        backgroundColor: "#e62224",
        color: "#ffffff"
    },
    redDeskStyleBW: {
        ...voteLegend,
        backgroundColor: "#aaa",
        color: "#000"
    },
    greenDeskStyle: {
        ...voteLegend,
        backgroundColor: "#64bb46",
        color: "#ffffff"
    },
    greenDeskStyleBW: {
        ...voteLegend,
        backgroundColor: "#000",
        color: "#fff"
    },
    blueDeskStyle: {
        ...voteLegend,
        backgroundColor: "#98d8e1",
        color: "#ffffff"
    },
    blueDeskStyleBW: {
        ...voteLegend,
        backgroundColor: "#fff",
        color: "#000"
    }
}

export default function Voting(props) {
    const [seats, setSeats] = useState([]);
    const [showColors, setShowColors] = useState(true);
    const [seatMap, setSeatMap] = useState([]);
    const [showVotes, setShowVotes] = useState(false)
    const { t } = useTranslation();

    const { meetingId, caseNumber, voting } = props

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`#--API_URL--#/seats/${meetingId}/${caseNumber}`)
            if (response.status === 200) {
                const data = await response.json();
                setSeats(data)
            }
        }
        fetchData()
    }, [setSeats])

    useEffect(() => {
        const tempSeatMap = []
        seats.forEach(seat => {
            if (!isNaN(seat.seatId)) {
                let voteType = 0;
                const vote = voting.votes.find(vote => vote.name === seat.person)
                if (vote !== undefined) {
                    voteType = vote.voteType
                }
                let name = seat.person;
                if ("fi" === "#--LANGUAGE--#".toLowerCase()) {
                    name += seat.additionalInfoFI?.length > 0 ? ` (${seat.additionalInfoFI})` : ""
                } else {
                    name += seat.additionalInfoSV?.length > 0 ? ` (${seat.additionalInfoSV})` : ""
                }
                tempSeatMap[Number(seat.seatId)] = {
                    name,
                    voteType
                }
            }
        })
        setSeatMap(tempSeatMap)
    }, [seats])

    const createVoterElement = (vote) => {
        return (
            <div>{vote.name}</div>
        )
    }

    const downloadPDF = (e) => {
        e.preventDefault()
        let doc = new jsPDF("landscape", 'pt', 'A4');
        doc.setFontSize(8)
        doc.html(document.getElementById('print-area'), {
            html2canvas: {
                scale: 0.7
            },
            callback: () => {
                doc.save('vote.pdf');
            },
            margin: [40, 200, 60, 40]
        })
    }

    const toggleColors = () => {
        setShowColors(!showColors)
    }

    return (
        <div id="print-area" style={{ boxSixing: 'inherit' }}>
            <div style={headingStyle}>{t("Voting")}</div>
            <div style={votingInfo}>
                <div>
                    <div style={voteCount}>{voting.forTitleFI}: {voting.forCount}</div>
                    <div style={voteCount}>{voting.againstTitleFI}: {voting.againstCount}</div>
                    <div style={voteCount}>{t("Empty")}: {voting.emptyCount}</div>
                    <div style={voteCount}>{t("Absent")}: {voting.absentCount}</div>
                </div>
                <div>
                    <div style={showColors ? seatColorStyles.greenDeskStyle : seatColorStyles.greenDeskStyleBW}>{voting.forCount}</div>
                    <div style={showColors ? seatColorStyles.redDeskStyle : seatColorStyles.redDeskStyleBW}>{voting.againstCount}</div>
                    <div style={showColors ? seatColorStyles.blueDeskStyle : seatColorStyles.blueDeskStyleBW}>{voting.emptyCount}</div>
                    <div style={voteLegend}>{voting.absentCount}</div>
                </div>
                <div style={miniChamberStyle}>
                    <SeatRow showName={false} showColors={showColors} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={0} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={1} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={2} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={3} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={4} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={5} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={6} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={7} seats={seatMap}></SeatRow>
                    <SeatRow showName={false} showColors={showColors} rowNr={8} seats={seatMap}></SeatRow>
                </div>
            </div>
            <div>
                <div style={{ padding: "30px 10px 0 0" }}>
                    <button style={agendaButtonStyle} onClick={() => setShowVotes(!showVotes)} data-html2canvas-ignore={"true"}>
                        <div style={{ paddingRight: "10px", marginTop: "4px" }}>
                            {showVotes
                                ? <FaCaretUp />
                                : <FaCaretDown />}
                        </div>
                        {t("Show vote details")}
                    </button>
                </div>
                {showVotes &&
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={chamberStyle}>
                            <SeatRow showName={true} showColors={showColors} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={0} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={1} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={2} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={3} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={4} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={5} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={6} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={7} seats={seatMap}></SeatRow>
                            <SeatRow showName={true} showColors={showColors} rowNr={8} seats={seatMap}></SeatRow>
                        </div>
                        <a href='javascript:void(0)' onClick={toggleColors} data-html2canvas-ignore={"true"} style={linkStyle}>
                            {showColors ? t("Show black and white vote map") : t("Show vote map with colors")}
                        </a>
                        <a href="javascript:void(0)" onClick={downloadPDF} data-html2canvas-ignore={"true"} style={linkStyle}>
                            {t("Download voting map pdf")}
                        </a>
                        <div style={voteListContainerStyle} data-html2canvas-ignore={"true"}>
                            <div>{t("FOR")}</div>
                            <br />
                            {voting && seatMap.filter(vote => vote.voteType === 0).map(vote => createVoterElement(vote))}
                            <br />
                            <div>{t("AGAINST")}</div>
                            <br />
                            {voting && seatMap.filter(vote => vote.voteType === 1).map(vote => createVoterElement(vote))}
                            <br />
                            <div>{t("EMPTY")}</div>
                            <br />
                            {voting && seatMap.filter(vote => vote.voteType === 2).map(vote => createVoterElement(vote))}
                            <br />
                            <div>{t("ABSENT")}</div>
                            <br />
                            {voting && seatMap.filter(vote => vote.voteType === 3).map(vote => createVoterElement(vote))}
                        </div>
                    </div>
                }
            </div>
        </div >
    )
}
