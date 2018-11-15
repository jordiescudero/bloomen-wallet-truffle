// File: `./contracts/SimpleStorage.sol`

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Strings.sol";

contract SmJson {

  using Strings for *;

  struct PathValue{
    string path;
    string value;
    string valueType;
  }

  mapping (bytes32 => uint[]) private hashIndexMap_;

  PathValue[] private data_;

  function getNodes() public view returns (PathValue[]){    
    return data_;
  }

  function addPath(string _path, string _value, string _valueType) public {
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

  function deletePath(string _path) public {
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

  function modifyPath(string _path, string _value, string _valueType) public {
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