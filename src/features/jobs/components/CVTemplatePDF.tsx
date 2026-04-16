import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer'
import type { z } from 'zod'
import type { CVDataSchema } from '@shared/schemas'

type CVData = z.infer<typeof CVDataSchema>

const s = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.5,
    paddingVertical: 48,
    paddingHorizontal: 64,
    color: '#111',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  contact: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  contactText: {
    color: '#111',
  },
  link: {
    color: '#111827',
    textDecoration: 'none',
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 4,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    marginBottom: 6,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryLeft: {
    flex: 1,
  },
  entryOrg: {
    fontFamily: 'Times-Bold',
    fontSize: 10,
  },
  entryRole: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
  },
  entryRight: {
    textAlign: 'right',
    fontSize: 10,
    paddingLeft: 16,
  },
  entryLocation: {
    fontFamily: 'Times-Italic',
  },
  bulletList: {
    marginTop: 2,
    marginBottom: 10,
    paddingLeft: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 10,
    width: 10,
  },
  bulletText: {
    fontSize: 10,
    flex: 1,
  },
  skillItem: {
    fontSize: 10,
    marginBottom: 2,
  },
  educationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
})

interface EntryProps {
  org: string
  role: string
  location: string
  dates: string
  bullets: string[]
}

function Entry({ org, role, location, dates, bullets }: EntryProps) {
  return (
    <>
      <View style={s.entryRow}>
        <View style={s.entryLeft}>
          <Text style={s.entryOrg}>{org}</Text>
          <Text style={s.entryRole}>{role}</Text>
        </View>
        <View style={s.entryRight}>
          <Text style={s.entryLocation}>{location}</Text>
          <Text>{dates}</Text>
        </View>
      </View>
      <View style={s.bulletList}>
        {bullets.map((b, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
    </>
  )
}

interface CVTemplatePDFProps {
  data: CVData
}

function CVTemplatePDF({ data }: CVTemplatePDFProps) {
  return (
    <Document>
      <Page size='A4' style={s.page}>
        <Text style={s.name}>{data.name}</Text>

        <View style={s.contact}>
          <Text style={s.contactText}>{data.location} • </Text>
          <Link src={`mailto:${data.email}`} style={s.link}>{data.email}</Link>
          <Text style={s.contactText}> • </Text>
          <Link src={data.linkedin} style={s.link}>{data.linkedin}</Link>
          <Text style={s.contactText}> • </Text>
          <Link src={data.github} style={s.link}>{data.github}</Link>
        </View>

        {data.leadership.length > 0 && (
          <>
            <Text style={s.sectionHeading}>Leadership Activities</Text>
            <View style={s.hr} />
            {data.leadership.map((entry, i) => (
              <Entry key={i} {...entry} />
            ))}
          </>
        )}

        <Text style={s.sectionHeading}>Experience</Text>
        <View style={s.hr} />
        {data.experience.map((entry, i) => (
          <Entry key={i} {...entry} />
        ))}

        <Text style={s.sectionHeading}>Skills</Text>
        <View style={s.hr} />
        <Text style={s.skillItem}><Text style={s.entryOrg}>Technical: </Text>{data.skills.technical}</Text>
        <Text style={s.skillItem}><Text style={s.entryOrg}>Languages: </Text>{data.skills.languages}</Text>

        <Text style={s.sectionHeading}>Education</Text>
        <View style={s.hr} />
        {data.education.map((edu, i) => (
          <View key={i} style={s.educationRow}>
            <View style={s.entryLeft}>
              <Text style={s.entryOrg}>{edu.university}</Text>
              <Text style={s.entryRole}>{edu.degree}</Text>
            </View>
            <View style={s.entryRight}>
              <Text style={s.entryLocation}>{edu.location}</Text>
              <Text>{edu.dates}</Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default CVTemplatePDF
