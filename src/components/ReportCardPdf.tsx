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
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 12,
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

interface ReportCardPdfProps {
  schoolName: string;
  className: string;
  examName: string;
  students: Array<{
    admissionNo: string;
    name: string;
    parentName: string | null;
    marks: Array<{ subject: string; score: number | null; grade: string }>;
  }>;
}

function ReportCardDocument({ schoolName, className, examName, students }: ReportCardPdfProps) {
  return (
    <Document>
      {students.map((student) => (
        <Page key={student.admissionNo} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.schoolName}>{schoolName}</Text>
            <Text>{className} — {examName}</Text>
          </View>
          <View style={styles.row}>
            <Text>Student: {student.name}</Text>
            <Text>Admission: {student.admissionNo}</Text>
          </View>
          <Text>Parent/Guardian: {student.parentName || "—"}</Text>
          <Text style={styles.sectionTitle}>Subject scores</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader, { width: "40%" }]}>Subject</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { width: "20%" }]}>Score</Text>
              <Text style={[styles.tableCell, styles.tableHeader, { width: "40%" }]}>Grade</Text>
            </View>
            {student.marks.map((mark) => (
              <View key={mark.subject} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "40%" }]}>{mark.subject}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{mark.score ?? "—"}</Text>
                <Text style={[styles.tableCell, { width: "40%" }]}>{mark.grade}</Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export function ReportCardPdf({ schoolName, className, examName, students }: ReportCardPdfProps) {
  return (
    <PDFDownloadLink
      document={<ReportCardDocument schoolName={schoolName} className={className} examName={examName} students={students} />}
      fileName={`${className}-${examName}-reportcards.pdf`}
      className="btn-accent"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Download report cards")}
    </PDFDownloadLink>
  );
}
