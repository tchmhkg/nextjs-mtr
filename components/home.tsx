'use client'

import CurrLocation from '@components/curr-location'
import ContextChip from '@components/picker/context-chip'
import InterchangeDialog from '@components/picker/interchange-dialog'
import LinePicker from '@components/picker/line-picker'
import LrRoutePicker from '@components/picker/lr-route-picker'
import LrStationList, { LR_COLOR } from '@components/picker/lr-station-list'
import ModeToggle from '@components/picker/mode-toggle'
import StationList from '@components/picker/station-list'
import Result from '@components/train/result'
import {
  type HomeController,
  type LrDir,
  useHomeController,
} from '@hooks/useHomeController'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import type { LrStation } from '@utils/lr-data'
import type { ILine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

type Language = 'en' | 'tc'

const getLanguage = (lang: string): Language =>
  lang === 'tc' ? 'tc' : 'en'

type HomeProps = Readonly<{
  heading?: string
  initialModeFromUrl?: TransportMode
  initialLineFromUrl?: string | null
  initialDirFromUrl?: string | null
  initialStaFromUrl?: string | null
  initialSchedule?: NextTrainDto | null
  initialScheduleFailed?: boolean
}>

type HomePickerBodyProps = Readonly<{
  pickerStep: 'line' | 'station'
  selectedLine: ILine | null
  selectedStation: IStation | null
  lineStations: ReturnType<typeof DATA.find>
  stationListRef: React.RefObject<HTMLDivElement | null>
  stationRefs: Record<string, React.RefObject<HTMLButtonElement | null>>
  lang: Language
  onChangeLine: (line: ILine) => void
  onSelectStation: (station: IStation) => void
  onInterchange: (station: IStation) => void
  onBackToLines: () => void
}>

function HomePickerBody({
  pickerStep,
  selectedLine,
  selectedStation,
  lineStations,
  stationListRef,
  stationRefs,
  lang,
  onChangeLine,
  onSelectStation,
  onInterchange,
  onBackToLines,
}: HomePickerBodyProps) {
  const t = useTranslations()

  return (
    <>
      {pickerStep === 'station' && selectedLine ? (
        <button
          type="button"
          onClick={onBackToLines}
          className="mb-2 text-sm text-muted hover:text-ink md:hidden"
          aria-label={t('Select a line')}
        >
          ← {t('Select a line')}
        </button>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:gap-0">
        <div
          className={`md:w-52 md:shrink-0 md:border-r md:border-border md:pr-2 ${pickerStep === 'station' ? 'hidden md:block' : 'block'
            }`}
        >
          <div className="mb-1 hidden px-2 text-xs font-medium uppercase tracking-wide text-muted md:block">
            {t('Select a line')}
          </div>
          <div className="md:hidden">
            <LinePicker
              selectedCode={selectedLine?.code}
              onSelect={onChangeLine}
              variant="chips"
            />
          </div>
          <div className="hidden md:block">
            <LinePicker
              selectedCode={selectedLine?.code}
              onSelect={onChangeLine}
              variant="rail"
            />
          </div>
        </div>

        {selectedLine ? (
          <div
            className={`min-w-0 flex-1 md:pl-2 ${pickerStep === 'line' ? 'hidden md:block' : 'block'
              }`}
          >
            <div
              className="mb-1 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted"
              style={{ borderLeft: `3px solid ${selectedLine.color}` }}
            >
              <span className="pl-2">
                {selectedLine.label[lang]} · {t('stations')}
              </span>
            </div>
            <StationList
              ref={stationListRef}
              stations={lineStations?.stations ?? []}
              selectedCode={selectedStation?.code}
              lineColor={selectedLine.color}
              onSelect={onSelectStation}
              onInterchange={onInterchange}
              stationRefs={stationRefs}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}

type LrPickerBodyProps = Readonly<{
  lrPickerStep: 'route' | 'station'
  lrRouteCode: string | null
  lrDir: LrDir
  lrStationId: string | null
  lrStops: readonly LrStation[]
  lrListRef: React.RefObject<HTMLDivElement | null>
  onSelectLrRoute: (routeCode: string) => void
  onChangeLrDir: (d: LrDir) => void
  onSelectLrStation: (station: LrStation) => void
  onBackToRoutes: () => void
}>

function LrPickerBody({
  lrPickerStep,
  lrRouteCode,
  lrDir,
  lrStationId,
  lrStops,
  lrListRef,
  onSelectLrRoute,
  onChangeLrDir,
  onSelectLrStation,
  onBackToRoutes,
}: LrPickerBodyProps) {
  const t = useTranslations()

  return (
    <>
      {lrPickerStep === 'station' && lrRouteCode ? (
        <button
          type="button"
          onClick={onBackToRoutes}
          className="mb-2 text-sm text-muted hover:text-ink md:hidden"
          aria-label={t('Select a route')}
        >
          ← {t('Select a route')}
        </button>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:gap-0">
        <div
          className={`md:w-40 md:shrink-0 md:border-r md:border-border md:pr-2 ${lrPickerStep === 'station' ? 'hidden md:block' : 'block'
            }`}
        >
          <div className="mb-1 hidden px-2 text-xs font-medium uppercase tracking-wide text-muted md:block">
            {t('Select a route')}
          </div>
          <div className="md:hidden">
            <LrRoutePicker
              selectedCode={lrRouteCode}
              onSelect={onSelectLrRoute}
              variant="chips"
            />
          </div>
          <div className="hidden md:block">
            <LrRoutePicker
              selectedCode={lrRouteCode}
              onSelect={onSelectLrRoute}
              variant="rail"
            />
          </div>
        </div>

        {lrRouteCode ? (
          <div
            className={`min-w-0 flex-1 md:pl-2 ${lrPickerStep === 'route' ? 'hidden md:block' : 'block'
              }`}
          >
            <div
              className="mb-2 flex flex-wrap items-center gap-2 px-1"
              style={{ borderLeft: `3px solid ${LR_COLOR}` }}
            >
              <span className="pl-2 text-xs font-medium uppercase tracking-wide text-muted">
                {lrRouteCode} · {t('stations')}
              </span>
              <fieldset className="ml-auto m-0 flex gap-1 rounded-md border border-border p-0.5">
                <legend className="sr-only">{t('Direction')}</legend>
                {([1, 2] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onChangeLrDir(d)}
                    aria-pressed={lrDir === d}
                    className={`rounded px-2 py-0.5 text-xs tabular-nums ${lrDir === d
                      ? 'bg-surface-alt font-medium text-ink'
                      : 'text-muted hover:text-ink'
                      }`}
                  >
                    {t('Direction')} {d}
                  </button>
                ))}
              </fieldset>
            </div>
            <LrStationList
              key={`${lrRouteCode}-${lrDir}`}
              ref={lrListRef}
              stations={lrStops}
              selectedId={lrStationId}
              onSelect={onSelectLrStation}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}

function HomeHeader({
  heading,
  locating,
  getCurrLocation,
}: Readonly<{
  heading: string
  locating: boolean
  getCurrLocation: () => void
}>) {
  const t = useTranslations()
  return (
    <header className="mb-3 flex items-center justify-between gap-3">
      <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-ink md:text-2xl">
        {heading}
      </h1>
      {/* Fixed slot so MTR↔LR mode switch does not shift the header / schedule refresh. */}
      <div className="flex size-11 shrink-0 items-center justify-center">
        <CurrLocation
          onClick={getCurrLocation}
          aria-label={t('Find nearest station')}
          busy={locating}
        />
      </div>
    </header>
  )
}

function HomeGlance({
  c,
  lang,
}: Readonly<{ c: HomeController; lang: Language }>) {
  const t = useTranslations()
  if (!c.showGlance) return null

  if (c.mode === 'mtr' && c.selectedLine && c.selectedStation) {
    const station = c.selectedStation
    return (
      <ContextChip
        lineLabel={c.selectedLine.label[lang]}
        stationLabel={station.label[lang]}
        lineColor={c.selectedLine.color}
        changeLabel={t('Change')}
        onChange={c.startEditing}
        interchangeLabel={c.hasInterchange ? t('Interchange') : undefined}
        onInterchange={
          c.hasInterchange
            ? () => c.showInterchangeOptions(station)
            : undefined
        }
      />
    )
  }

  if (c.mode === 'lr' && c.lrRouteCode && c.lrStation) {
    return (
      <ContextChip
        lineLabel={`${t('Light Rail')} ${c.lrRouteCode}`}
        stationLabel={c.lrStation.label[lang]}
        lineColor={LR_COLOR}
        changeLabel={t('Change')}
        onChange={c.startEditing}
      />
    )
  }

  return null
}

function HomePicker({
  c,
  lang,
}: Readonly<{ c: HomeController; lang: Language }>) {
  const t = useTranslations()
  if (c.showGlance) return null

  return (
    <section
      className="mb-4 rounded-xl border border-border bg-surface-alt/80 p-3"
      aria-label={t('Train line and station selection')}
    >
      {c.mode === 'mtr' ? (
        <HomePickerBody
          pickerStep={c.pickerStep}
          selectedLine={c.selectedLine}
          selectedStation={c.selectedStation}
          lineStations={c.lineStations}
          stationListRef={c.stationListRef}
          stationRefs={c.stationRefs}
          lang={lang}
          onChangeLine={c.onChangeLine}
          onSelectStation={c.onSelectStation}
          onInterchange={c.showInterchangeOptions}
          onBackToLines={() => c.setPickerStep('line')}
        />
      ) : (
        <LrPickerBody
          lrPickerStep={c.lrPickerStep}
          lrRouteCode={c.lrRouteCode}
          lrDir={c.lrDir}
          lrStationId={c.lrStationId}
          lrStops={c.lrStops}
          lrListRef={c.lrListRef}
          onSelectLrRoute={c.onSelectLrRoute}
          onChangeLrDir={c.onChangeLrDir}
          onSelectLrStation={c.onSelectLrStation}
          onBackToRoutes={() => c.setLrPickerStep('route')}
        />
      )}
    </section>
  )
}

function HomeSchedule({ c }: Readonly<{ c: HomeController }>) {
  if (c.mode === 'mtr' && c.hasMtrSelection && c.selectedLine && c.selectedStation) {
    return (
      <div id="schedule-panel">
        <Result
          key={`mtr-${c.selectedLine.code}-${c.selectedStation.code}`}
          mode="mtr"
          line={c.selectedLine.code}
          sta={c.selectedStation.code}
          initialSchedule={c.scheduleForResult}
          initialScheduleFailed={c.mtrScheduleFailed}
        />
      </div>
    )
  }

  if (c.mode === 'lr' && c.lrStationId) {
    return (
      <div id="schedule-panel">
        <Result
          key={`lr-${c.lrStationId}`}
          mode="lr"
          sta={c.lrStationId}
          initialSchedule={c.scheduleForResult}
          initialScheduleFailed={c.lrScheduleFailed}
        />
      </div>
    )
  }

  return null
}

function HomeView({
  heading,
  c,
}: Readonly<{ heading: string; c: HomeController }>) {
  const locale = useLocale()
  const t = useTranslations()
  const lang = getLanguage(locale)

  return (
    <div className="mx-auto w-full max-w-5xl">
      <HomeHeader
        heading={heading}
        locating={c.locating}
        getCurrLocation={c.getCurrLocation}
      />
      <ModeToggle mode={c.mode} onChange={c.onChangeMode} />
      {c.locationError ? (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {t(c.locationError)}
        </p>
      ) : null}
      <HomeGlance c={c} lang={lang} />
      <HomePicker c={c} lang={lang} />
      <HomeSchedule c={c} />
      {c.interchangeFor ? (
        <InterchangeDialog
          station={c.interchangeFor}
          onSelect={c.switchLine}
          onClose={() => c.setInterchangeFor(null)}
        />
      ) : null}
    </div>
  )
}

const Home = ({
  heading = 'MTR Next Train',
  ...controllerProps
}: HomeProps) => {
  const c = useHomeController(controllerProps)
  return <HomeView heading={heading} c={c} />
}

export default React.memo(Home)
