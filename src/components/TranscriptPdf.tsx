"use client";

import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  table: {
    width: "auto",
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    padding: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    fontWeight: "bold",
  },
});

interface TranscriptPdfProps {
  schoolName: string;
  studentName: string;
  admissionNo: string;
  classroom: string;
  records: Array<{ exam: string; subject: string; score: number | null; grade: string }>;
}

function TranscriptDocument({ schoolName, studentName, admissionNo, classroom, records }: TranscriptPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{schoolName}</Text>
          <Text>Transcript for {studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text>Admission: {admissionNo}</Text>
          <Text>Class: {classroom}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHeader, { width: "35%" }]}>Exam</Text>
            <Text style={[styles.tableCell, styles.tableHeader, { width: "25%" }]}>Subject</Text>
            <Text style={[styles.tableCell, styles.tableHeader, { width: "20%" }]}>Score</Text>
            <Text style={[styles.tableCell, styles.tableHeader, { width: "20%" }]}>Grade</Text>
          </View>
          {records.map((record, index) => (
            <View key={`${record.exam}-${record.subject}-${index}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "35%" }]}>{record.exam}</Text>
              <Text style={[styles.tableCell, { width: "25%" }]}>{record.subject}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{record.score ?? "—"}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{record.grade}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export function TranscriptPdf({ schoolName, studentName, admissionNo, classroom, records }: TranscriptPdfProps) {
  return (
    <PDFDownloadLink
      document={<TranscriptDocument schoolName={schoolName} studentName={studentName} admissionNo={admissionNo} classroom={classroom} records={records} />}
      fileName={`${studentName.replace(/\s+/g, "_")}-transcript.pdf`}
      className="btn-accent"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Download transcript")}
    </PDFDownloadLink>
  );
}
