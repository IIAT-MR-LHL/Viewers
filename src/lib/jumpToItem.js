import { OHIF } from 'ohif-core'

// TODO: Move this function to OHIF itself so we can use it on the OHIF measurment table (when it is finished)

/**
 * Activates a set of measurements
 *
 * @param measurementData
 * @param viewportsState
 * @param timepointManagerState
 * @param options
 */
export default function jumpToRowItem(
  measurementData,
  viewportsState,
  timepointManagerState,
  options = { invertViewportTimepointsOrder: false, childToolKey: null }
) {
  const numViewports = viewportsState.layout.viewports.length
  const numTimepoints = timepointManagerState.timepoints.length
  const { measurements, timepoints } = timepointManagerState
  const numViewportsToUpdate = Math.min(numTimepoints, numViewports)
  const { toolType, measurementNumber } = measurementData

  if (options.invertViewportTimepointsOrder) {
    timepoints.reverse()
  }

  const measurementsForToolGroup = measurements[toolType]

  // Retrieve the measurements data
  const measurementsToJumpTo = []
  for (let i = 0; i < numViewportsToUpdate; i++) {
    const { timepointId } = timepoints[i]

    const dataAtThisTimepoint = measurementsForToolGroup.find(entry => {
      return (
        entry.timepointId === timepointId &&
        entry.measurementNumber === measurementNumber
      )
    })

    if (!dataAtThisTimepoint) {
      measurementsToJumpTo.push(null)
      continue;
    }

    let measurement = dataAtThisTimepoint

    const { tool } = OHIF.measurements.MeasurementApi.getToolConfiguration(
      toolType
    )
    if (options.childToolKey) {
      measurement = dataAtThisTimepoint[options.childToolKey]
    } else if (Array.isArray(tool.childTools)) {
      const key = tool.childTools.find(key => !!dataAtThisTimepoint[key])
      measurement = dataAtThisTimepoint[key]
    }

    measurementsToJumpTo.push(measurement)
  }

  // TODO: Add a single viewports state action which allows
  // - viewportData to be set
  // - layout to be set
  // - activeViewport to be set

  // Needs to update viewports.viewportData state to set image set data

  const displaySetContainsSopInstance = (displaySet, sopInstanceUid) =>
    displaySet.images.find(
      image => image.getSOPInstanceUID() === sopInstanceUid
    )

  const viewportSpecificData = []
  measurementsToJumpTo.forEach((data, viewportIndex) => {
    // Skip if there is no measurement to jump
    if (!data) {
      return
    }

    const study = OHIF.utils.studyMetadataManager.get(data.studyInstanceUid)
    if (!study) {
      throw new Error('Study not found.')
    }

    const displaySet = study.findDisplaySet(displaySet => {
      return displaySetContainsSopInstance(displaySet, data.sopInstanceUid)
    })

    if (!displaySet) {
      throw new Error('Display set not found.')
    }

    displaySet.sopInstanceUid = data.sopInstanceUid
    if (data.frameIndex) {
      displaySet.frameIndex = data.frameIndex
    }

    viewportSpecificData.push({
      viewportIndex,
      displaySet,
    })
  })

  return {
    viewportSpecificData,
    layout: [], // TODO: if we need to change layout, we should return this here
  }
}
