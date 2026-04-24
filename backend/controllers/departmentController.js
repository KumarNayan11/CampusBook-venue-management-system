const Department = require('../models/Department');
const User = require('../models/User');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('hodId', 'name email')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, hodId } = req.body;
    const department = await Department.create({ name, hodId: hodId || undefined });

    // If a HOD was assigned, link this department back to that user
    if (hodId) {
      // Clear any previous department assignment for this HOD
      await User.updateMany({ departmentId: department._id, _id: { $ne: hodId } }, { departmentId: null });
      await User.findByIdAndUpdate(hodId, { departmentId: department._id });
    }

    const populated = await Department.findById(department._id).populate('hodId', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, hodId } = req.body;
    const deptId = req.params.id;

    // Find the current department to detect HOD change
    const existing = await Department.findById(deptId);
    if (!existing) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const prevHodId = existing.hodId ? existing.hodId.toString() : null;
    const newHodId = hodId || null;

    // If HOD changed, reconcile User.departmentId links
    if (prevHodId !== newHodId) {
      // Clear old HOD's department link
      if (prevHodId) {
        await User.findByIdAndUpdate(prevHodId, { departmentId: null });
      }
      // Set new HOD's department link
      if (newHodId) {
        // If the new HOD was previously linked to another dept, clear that dept's hodId
        await Department.updateMany({ hodId: newHodId, _id: { $ne: deptId } }, { hodId: null });
        await User.findByIdAndUpdate(newHodId, { departmentId: deptId });
      }
    }

    const updateData = { name };
    updateData.hodId = newHodId; // null clears the field

    const department = await Department.findByIdAndUpdate(deptId, updateData, {
      new: true,
      runValidators: true,
    }).populate('hodId', 'name email');

    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Clear the HOD's departmentId link before deleting
    if (department.hodId) {
      await User.findByIdAndUpdate(department.hodId, { departmentId: null });
    }

    // Integrity: Convert all departmental venues belonging to this dept into central venues
    const Venue = require('../models/Venue');
    await Venue.updateMany(
      { departmentId: req.params.id },
      { type: 'central', departmentId: null }
    );

    await department.deleteOne();
    res.json({ message: 'Department deleted and associated venues migrated to central oversight' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
