"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  ModalContent,
  useDisclosure,
  ModalHeader,
  Divider,
  Card,
  CardHeader,
} from "@nextui-org/react";
import NewChart from "@/components/chart";

interface Row {
  key: string;
  id: number;
  model: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  summary: string;
  transcript: string;
}

const rows: Row[] = [];

interface Column {
  key: keyof Row;
  label: string;
}

const columns: Column[] = [
  { key: "id", label: "Claim ID" },
  { key: "model", label: "Model" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount ($USD)" },
  { key: "status", label: "Open" },
  { key: "description", label: "Description" },
];

export default function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentItem, setCurrentItem] = React.useState<Row | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/get_claims');
        const data = await response.json();
        console.log(data)
        if (data.success && data.message && data.message.claim_data) {
          let claim_data = JSON.parse(data.message.claim_data);
          const formattedData = claim_data.map((claim: any, index: number) => ({
            key: (index + 1).toString(),
            id: claim.id,
            model: claim.model,
            description: claim.description,
            date: claim.date,
            amount: claim.amount,
            status: claim.status,
            summary: claim.summary,
            transcript: claim.transcript
          }));
          console.log(formattedData)
          setRows(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const [videoSrc, setVideoSrc] = useState('');

  const fetchVideo = async (name: string) => {
    try {
      const response = await fetch(`https://shreyj1729--mind-tune-dir-gaze-video-dev.modal.run/?user_id=${name}`);     
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setVideoSrc(blobUrl);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const renderCell = (item: Row, columnKey: keyof Row) => {
    const cellValue = getKeyValue(item, columnKey);

    if (columnKey === "description") {
      let bgColorClass;
      // Determine the background color class based on the score range
      if (cellValue < 80) {
        bgColorClass = 'bg-red-500'; // Red for low scores
      } else if (cellValue < 90) {
        bgColorClass = 'bg-yellow-500'; // Yellow for medium scores
      } else {
        bgColorClass = 'bg-green-500'; // Green for high scores
      }
      return (
        <>
          <Button onPress={() => {
              setCurrentItem(item); // Update the currentItem
              onOpen();
            }}
            className={`text-white ${bgColorClass}`}
            >{cellValue}</Button>
        </>
      );
    }
    return cellValue;
  };

  return (
    <>
      <Table aria-label="Example table with dynamic content">
        <TableHeader columns={columns}>
          {(column: Column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item: Row) => (
            <TableRow key={item.key}>
              {(columnKey: keyof Row) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal backdrop={'blur'} isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent >
          {(onClose) => (
            <>
              <ModalHeader className="justify-center">
                {currentItem ? 
                  `Extended description and transcript for claim ID [${currentItem.id}]` 
                  : 'Score Report'
                }
              </ModalHeader>
              <ModalBody style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Divider orientation="vertical"></Divider>
                { currentItem &&
                <Card radius="lg" style={{ textAlign: 'center', padding: '10px' }}>
                  <CardHeader className="justify-center text-md font-semibold">
                    Summary
                  </CardHeader>
                  {currentItem.summary}
                </Card>}
                { currentItem &&
                <Card radius="lg" style={{ textAlign: 'center', padding: '10px' }}>
                  <CardHeader className="justify-center text-md font-semibold">
                    Transcript
                  </CardHeader>
                  {currentItem.transcript}
                </Card>}
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}