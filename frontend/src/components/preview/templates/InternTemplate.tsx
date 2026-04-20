import type { ResumeData, ResumeSection, EducationItem, ProjectItem, SkillItem, ExperienceItem, CertificationItem } from '../../../types/resume';
import type { TemplateProps } from './index';
import { fonts, colors } from './templateStyles';
import { addInlineListStyles } from '../../../utils/listStyles';
import { calculateAge } from '../../../utils/date';


function formatDate(start: string, end: string): string {
  const s = start.replace(/-/g, '.');
  const e = end.replace(/-/g, '.');
  if (!s && !e) return '';
  if (!e) return `${s} - 至今`;
  return `${s} - ${e}`;
}

/* ---- Sidebar Components ---- */

function SidebarSkillSection({ items }: { items: SkillItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '10px',
          fontFamily: fonts.heading,
        }}
      >
        专业技能
      </div>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: '8px' }}>
          {item.category && (
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', marginBottom: '3px' }}>
              {item.category}
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#d0d0d0', lineHeight: '1.5' }}>
            {item.skills}
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarEducationSection({ items }: { items: EducationItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '10px',
          fontFamily: fonts.heading,
        }}
      >
        教育经历
      </div>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
            {item.school}
          </div>
          {item.college && (
            <div style={{ fontSize: '11px', color: '#d0d0d0', marginTop: '1px' }}>
              {item.college}
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#d0d0d0', marginTop: '2px' }}>
            {[item.degree, item.major].filter(Boolean).join(' - ')}
          </div>
          <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '2px' }}>
            {formatDate(item.startDate, item.endDate)}
          </div>
          {item.gpa && (
            <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '1px' }}>
              GPA: {item.gpa}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SidebarCertificationSection({ items }: { items: CertificationItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '10px',
          fontFamily: fonts.heading,
        }}
      >
        证书认证
      </div>
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '11px', color: '#d0d0d0' }}>
            {item.name}
          </div>
          {item.issuer && (
            <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '1px' }}>
              {item.issuer} {item.date ? `| ${item.date.replace(/-/g, '.')}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- Main Content Components ---- */

function MainSectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: `2px solid ${colors.heading}`,
        paddingBottom: '4px',
        marginBottom: '10px',
      }}
    >
      <span style={{ fontSize: '15px', fontWeight: 'bold', color: colors.heading, fontFamily: fonts.heading }}>
        {title}
      </span>
    </div>
  );
}

function MainExperienceSection({ items }: { items: ExperienceItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <MainSectionTitle title="工作经验" />
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: colors.text }}>
              {item.company}
            </span>
            <span style={{ fontSize: '11px', color: colors.textLight }}>
              {formatDate(item.startDate, item.endDate)}
              {item.location ? `  |  ${item.location}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '2px' }}>
            {item.position}
          </div>
          {item.description && item.description.filter(Boolean).length > 0 && (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', lineHeight: '1.5' }}>
              {item.description.filter(Boolean).map((d, i) => (
                <li key={i} style={{ fontSize: '11px', color: colors.textSecondary }} dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function MainProjectSection({ items }: { items: ProjectItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <MainSectionTitle title="项目经历" />
      {items.map((item) => {
        const descs = item.description?.filter(Boolean) || [];
        const techs = item.technologies?.filter(Boolean) || [];
        return (
          <div key={item.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: colors.text }}>
                {item.name || '项目名称'}
              </span>
              <span style={{ fontSize: '11px', color: colors.textLight, flexShrink: 0 }}>
                {formatDate(item.startDate, item.endDate)}
              </span>
            </div>
            {(item.role || item.url) && (
              <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '1px' }}>
                {item.role}
                {item.role && item.url ? ' · ' : ''}
                {item.url && <span style={{ color: colors.textLight }}>{item.url}</span>}
              </div>
            )}
            {techs.length > 0 && (
              <div style={{ fontSize: '10px', color: colors.textLight, marginTop: '3px' }}>
                {techs.map((t, i) => (
                  <span key={i} style={{ display: 'inline-block', padding: '0 5px', margin: '1px 2px', borderRadius: '2px', background: '#f5f5f5', color: colors.textSecondary, fontSize: '10px', lineHeight: '17px' }}>{t}</span>
                ))}
              </div>
            )}
            {descs.length > 0 && (
              <div style={{ marginTop: '3px' }}>
                {descs.map((d, i) => (
                  <div key={i} style={{ fontSize: '11px', color: colors.textSecondary, lineHeight: '1.5', paddingLeft: '12px', position: 'relative', marginBottom: '1px' }}>
                    <span style={{ position: 'absolute', left: '0', top: '6px', width: '3px', height: '3px', borderRadius: '50%', background: colors.textLight }} />
                    <span dangerouslySetInnerHTML={{ __html: addInlineListStyles(d) }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- Main Template ---- */

export default function InternTemplate({ data, onePageScale, pageMargin = 40 }: TemplateProps) {
  const { personalInfo: p } = data;
  const sidebarBg = '#2c3e50';

  const skillSection = data.sections.find((s) => s.type === 'skill') as (ResumeSection & { type: 'skill'; items: SkillItem[] }) | undefined;
  const eduSection = data.sections.find((s) => s.type === 'education') as (ResumeSection & { type: 'education'; items: EducationItem[] }) | undefined;
  const certSection = data.sections.find((s) => s.type === 'certification') as (ResumeSection & { type: 'certification'; items: CertificationItem[] }) | undefined;
  const expSection = data.sections.find((s) => s.type === 'experience') as (ResumeSection & { type: 'experience'; items: ExperienceItem[] }) | undefined;
  const projSection = data.sections.find((s) => s.type === 'project') as (ResumeSection & { type: 'project'; items: ProjectItem[] }) | undefined;

  const contactParts: string[] = [];
  if (p.phone) contactParts.push(p.phone);
  if (p.email) contactParts.push(p.email);
  if (p.location) contactParts.push(p.location);
  const age = calculateAge(p.birthDate);
  if (age) contactParts.push(`${age}岁`);
  if (p.gender) contactParts.push(p.gender);
  if (p.website) contactParts.push(p.website);

  const isScaled = onePageScale !== null;

  return (
    <div
      style={{
        width: '794px',
        height: isScaled ? '1123px' : undefined,
        minHeight: isScaled ? undefined : '1123px',
        background: colors.background,
        fontFamily: fonts.body,
        color: colors.text,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: isScaled ? `scale(${onePageScale})` : undefined,
          transformOrigin: 'top left',
          width: isScaled ? `${794 / onePageScale}px` : '100%',
          height: '100%',
          display: 'flex',
        }}
      >
      {/* Left Sidebar - 30% */}
      <div
        style={{
          width: '30%',
          background: sidebarBg,
          padding: isScaled
            ? `${pageMargin / onePageScale}px ${pageMargin / 2 / onePageScale}px`
            : `${pageMargin}px ${pageMargin / 2}px`,
          boxSizing: 'border-box',
          color: '#ffffff',
        }}
      >
        {/* Name in sidebar */}
        <div data-preview-section="personal" style={{ paddingTop: '30px', textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#ffffff', fontFamily: fonts.heading }}>
            {p.name || '你的姓名'}
          </h1>
          {p.title && (
            <div style={{ fontSize: '12px', color: '#b0c4de', marginTop: '4px' }}>{p.title}</div>
          )}
        </div>

        {/* Contact in sidebar */}
        {contactParts.length > 0 && (
          <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px' }}>
            {contactParts.map((part, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#d0d0d0', marginBottom: '4px', wordBreak: 'break-all' }}>
                {part}
              </div>
            ))}
          </div>
        )}

        {skillSection && skillSection.items.length > 0 && (
          <SidebarSkillSection items={skillSection.items} />
        )}
        {eduSection && eduSection.items.length > 0 && (
          <SidebarEducationSection items={eduSection.items} />
        )}
        {certSection && certSection.items.length > 0 && (
          <SidebarCertificationSection items={certSection.items} />
        )}
      </div>

      {/* Right Main - 70% */}
      <div
        style={{
          width: '70%',
          padding: isScaled
            ? `${pageMargin / onePageScale}px ${pageMargin * 0.75 / onePageScale}px`
            : `${pageMargin}px ${pageMargin * 0.75}px`,
          boxSizing: 'border-box',
        }}
      >
        {/* Summary */}
        {p.summary && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', lineHeight: '1.6', color: colors.textSecondary, textAlign: 'justify' }}>
              {p.summary}
            </div>
          </div>
        )}

        {/* Experience */}
        {expSection && expSection.items.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <MainExperienceSection items={expSection.items} />
          </div>
        )}

        {/* Projects */}
        {projSection && projSection.items.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <MainProjectSection items={projSection.items} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
