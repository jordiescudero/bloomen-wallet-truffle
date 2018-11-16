pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Strings.sol";
import "./lib/Structs.sol";

contract JsonContainer is Structs {

  using Strings for *;

  mapping (bytes32 => uint[]) private hashIndexMap_;

  PathValue[] private data_;

  function getNodes() public view returns (PathValue[]){    
    return data_;
  }

  function initialize(PathValue[] _data) public {
    for (uint i = 0;i < _data.length; i++) {
      PathValue memory pathValue = _data[i];
      _addPath(pathValue.path, pathValue.value, pathValue.valueType);
    }
  }

  function add(string[] _paths, string[] _values, string[] _types) public {
    require(_paths.length == _values.length && _paths.length == _types.length);
    for (uint i = 0; i < _paths.length; i++) {
      _addPath(_paths[i], _values[i], _types[i]);
    }
  }
  
  function del(string[] _paths) public {
    for (uint i = 0; i < _paths.length; i++) {
      _deletePath(_paths[i]);
    }
  }

  function modify(string[] _paths, string[] _values, string[] _types) public {
    require(_paths.length == _values.length && _paths.length == _types.length);
    for (uint i = 0; i < _paths.length; i++) {
      _modifyPath(_paths[i], _values[i], _types[i]);
    }
  }

  function _addPath(string _path, string _value, string _valueType) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    if (indexArray.length > 0) {
      for (uint i = 0; i < indexArray.length; i++) {
        string memory storedPath = data_[indexArray[i]].path;
        require(!storedPath.toSlice().equals(_path.toSlice()));
      }
    }
    PathValue memory pathValue = PathValue(_path, _value, _valueType);
    for (i = 0; i < data_.length; i++) {
      if (data_[i].path.toSlice().empty()) {
        data_[i] = pathValue;
        hashIndexMap_[pathHash].push(i);
        return;
      }
    }
    data_.push(pathValue);
    hashIndexMap_[pathHash].push(data_.length - 1); 
  }

  function _deletePath(string _path) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    require(indexArray.length > 0);
    for (uint i = 0; i < indexArray.length; i++) {
      string memory storedPath = data_[indexArray[i]].path;
      if (storedPath.toSlice().equals(_path.toSlice())) {
        delete data_[indexArray[i]];
        delete hashIndexMap_[pathHash];
      }
    }
  }

  function _modifyPath(string _path, string _value, string _valueType) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    require(indexArray.length > 0);
    for (uint i = 0; i < indexArray.length; i++) {
      string memory storedPath = data_[indexArray[i]].path;
      if (storedPath.toSlice().equals(_path.toSlice())) {
        data_[indexArray[i]] = PathValue(_path, _value, _valueType);
        return;
      }
    }
  }

}